import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Package } from "../models/Package.models.js";
import { User } from "../models/User.models.js";
import { Provider } from "../models/Provider.models.js";
import { Review } from "../models/Review.models.js";
import { Notification } from "../models/Notification.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const addPackage = asyncHandler(async (req, res) => {
    const { title, date, description, destination, price, slots } = req.body;

    // Ensure only package providers can add packages
    const provider = await Provider.findById(req.provider._id);
    if (!provider) {
        throw new ApiError(403, "Only package providers can create packages!");
    }

    const newPackage = await Package.create({
        title,
        date,
        description,
        destination,
        price,
        availableSlots: slots,
        postedBy: provider._id
    });

    if (!newPackage) {
        throw new ApiError(400, "Error in uploading Package!");
    }

    await Provider.findByIdAndUpdate(provider._id,
        {
            $push: { packages: newPackage._id }
        }
    );

    return res.status(200).json(new ApiResponse(200, newPackage, "Package uploaded successfully!"));
});

const removePackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    if (!packageId) {
        throw new ApiError(400, "Package ID is required!");
    }

    const thisPackage = await Package.findById(packageId);

    if (!thisPackage) {
        throw new ApiError(404, "Package not found!");
    }

    if (thisPackage.postedBy.toString() !== req.provider._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this package!");
    }

    await Package.findByIdAndDelete(packageId);

    await Provider.findByIdAndUpdate(req.provider._id, {
        $pull: { packages: packageId }
    });

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Package deleted successfully!"));
});

// Enroll in a package
const enrollInPackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    
    const thisPackage = await Package.findById(packageId);
    if (!thisPackage) {
        throw new ApiError(404, "Package not found!");
    }
    
    if (thisPackage.enrolled.includes(req.user._id)) {
        throw new ApiError(400, "You are already enrolled in this package!");
    }
    
    if (thisPackage.availableSlots <= 0) {
        throw new ApiError(400, "No slots available!");
    }
    
    thisPackage.enrolled.push(req.user._id);
    thisPackage.availableSlots -= 1;
    await thisPackage.save();
    
    await User.findByIdAndUpdate(req.user._id,
        {
            $push : {packages : thisPackage._id}
        }
    );

    const notify = await Notification.create({
        user: thisPackage.postedBy,
        recipientModel : "Provider",
        message: `User ${req.user.userName} enrolled in your package "${thisPackage.title}"`,
        type: "package enrollment"
    });
    
    await Provider.findByIdAndUpdate(thisPackage.postedBy, { $push: { notifications: notify._id } });
    
    return res.status(200).json(new ApiResponse(200, thisPackage, "Successfully enrolled in package!"));
});


const searchPackageByTag = asyncHandler(async (req, res) => {
    const { tag } = req.query;

    if (!tag) {
        throw new ApiError(400, "Tag is required!");
    }

    const packages = await Package.find({ tags: { $in: [tag] } });

    return res.status(200).json(new ApiResponse(200, packages, "Packages filtered by tag!"));
});


const searchPackageByDestination = asyncHandler(async (req, res) => {
    const { destination } = req.query;

    if (!destination) {
        throw new ApiError(400, "destination is required!");
    }

    const packages = await Package.find({ destination: { $in: [destination] } });

    return res.status(200).json(new ApiResponse(200, packages, "Packages filtered by destination!"));
});


const searchPackageByPrice = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice } = req.query;

    if (!minPrice || !maxPrice) {
        throw new ApiError(400, "Both minPrice and maxPrice are required!");
    }

    const packages = await Package.find({
        price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }
    });

    return res.status(200).json(new ApiResponse(200, packages, "Packages filtered by price range!"));
});


// Get a package by ID
const getPackageById = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    if (!packageId) {
        throw new ApiError(400, "Package ID is required!");
    }

    const thisPackage = await Package.findById(packageId)
        .populate("postedBy", "fullName userName avatar") 
        .populate("enrolled", "fullName userName avatar")
        .populate("reviews" , "user text rating")

    if (!thisPackage) {
        throw new ApiError(404, "Package not found!");
    }

    return res.status(200).json(new ApiResponse(200, thisPackage, "Package details fetched successfully!"));
});


// Get initial package landing page with recent packages
const getPackagePage = asyncHandler(async (req, res) => {
    const packages = await Package.find().sort({ createdAt: -1 }).limit(10);

    return res.status(200).json(new ApiResponse(200, packages, "Recent packages fetched!"));
});


const markPackageComplete = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const thisPackage = await Package.findById(packageId);
    
    if (!thisPackage) {
        throw new ApiError(404, "Package not found!");
    }
    
    if (thisPackage.postedBy.toString() !== req.provider._id.toString()) {
        throw new ApiError(403, "Only the provider can mark the package as complete!");
    }
    
    thisPackage.IsCompleted = true;
    await thisPackage.save();
    
    return res.status(200).json(new ApiResponse(200, thisPackage, "Package marked as completed!"));
});


const addReviewToPackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const { rating, text } = req.body;
    
    const thisPackage = await Package.findById(packageId);
    if (!thisPackage) {
        throw new ApiError(404, "Package not found!");
    }
    
    if (!thisPackage.IsCompleted) {
        throw new ApiError(400, "Cannot review a package that is not completed!");
    }

    const isEnrolled = thisPackage.enrolled.some(userId => userId.toString() === req.user._id.toString());

    if (!isEnrolled) {
        throw new ApiError(403, "Only enrolled users can add reviews!");
    }

    const review = await Review.create({ user: req.user._id, text, rating });
    thisPackage.reviews.push(review._id);
    await thisPackage.save();
    
    const provider = await Provider.findById(thisPackage.postedBy);
    provider.reviews.push(review._id);
    await provider.save();
    
    const notify = await Notification.create({
        user: provider._id,
        recipientModel : "Provider",
        message: `User ${req.user.userName} left a review on your package "${thisPackage.title}"`,
        type: "package review"
    });
    await provider.notifications.push(notify._id);
    await provider.save();
    
    return res.status(200).json(new ApiResponse(200, review, "Review added successfully!"));
});

export { 
    addPackage, 
    removePackage, 
    enrollInPackage, 
    searchPackageByTag, 
    searchPackageByPrice, 
    searchPackageByDestination,
    getPackageById, 
    getPackagePage ,
    markPackageComplete,
    addReviewToPackage
};

