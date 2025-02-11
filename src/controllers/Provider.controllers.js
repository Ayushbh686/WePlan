import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.models.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Provider } from "../models/Provider.models.js";
import { ReviewProvider } from "../models/ReviewProvider.models.js";
import {Notification} from "../models/Notification.models.js";
import {Package} from "../models/Package.models.js";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (providerId)=>{
    const provider = await Provider.findOne({_id: providerId});
    if (!provider) {
        throw new ApiError(404, "provider not found");
    }
    const accessToken = await provider.generateAccessToken();
    const refreshToken = await provider.generateRefreshToken();

    provider.refreshToken = refreshToken;
    await provider.save({validateBeforeSave : false});

    return {accessToken ,refreshToken}
}

const registerProvider = asyncHandler(async (req , res)=>{
    //take user details 
    //check validation - emoty feild 
    //check if user exists : email , username
    //check for images and avatar 
    //upload them on cloudinary
    //create user object - make entry in db 
    //remove password and refresh token from response 
    //check user creation 
    //return res

    const {fullName , email , userName , password , phone} = req.body;
    // console.log("email : " , email);
    // console.log("req.files: ", req.files);
    if(
        [fullName , email , userName , password , phone].some((ele) => ele?.trim() === '') // ? means if ele exists
    ){
        throw new ApiError(400 , "no feild can be empty! ");
    }

    const existedUser = await Provider.findOne({
        $or:[{email} , {userName}]
    }); // User.findOne({email}) for search by email only

    if(existedUser){
        throw new ApiError(409 , "Proivder with these Username or email exists! ");
    }
    // console.log("req.files " , req.files);
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    const user = await Provider.create({
        fullName : fullName,
        email : email,
        userName : userName.toLowerCase(),
        password : password,
        phone
    });

    // console.log("user created : " , user);

    const createdUser = await Provider.findById(user._id).select(
        "-password -refreshToken"
    )

    // console.log("user to be sent as response : " , createdUser);

    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering provider! ");
    }

    return res.status(200).json(
        new ApiResponse(201 , createdUser , "proivder registered Successfully! ")
    )
});

const loginProvider = asyncHandler(async(req,res)=>{
    //takes user data from req body 
    //get username or email
    //find user in db
    //match password input
    //genrate refresh token and access token 
    //send cookie

    const {userName , email , password} = req.body;

    // console.log(req.body);

    if(!(userName || email)){
        throw new ApiError(404 , "email or userName is required! ");
    }

    const user = await Provider.findOne({
        $or : [{email} , {userName}]
    });

    if(!user){
        throw new ApiError(404 , "provider with this emial or username not found! ");
    }

    const isCorrect = await user.isPasswordCorrect(password)

    if(!isCorrect){
        throw new ApiError(400 , "Wrong password input ");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await Provider.findOne({
        $or: [{ email }, { userName }]
    }).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , 
            {
                "provider" : loggedInUser , accessToken , refreshToken
            },
            "used loggedIn successfully"
        )
    );
});

const logoutProvider = asyncHandler(async(req,res)=>{
    await Provider.findByIdAndUpdate(
        req.provider._id,
        {
            $unset : {
                refreshToken : 1 // unset the refresh token 
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200 , 
            {
            },
            "provider loggedOut successfully"
        )
    );    
})

//refresh both access and refresh token when user have valid refresh token , used when auth middle rejects access token as its expired so the system generates both new access and refresh token again , this function rotates refresh token after every use
/*
here the user refresh and access token both are rotated when access token expires and he still has refresh token so does that means the user wont have to login anytime if he continously uses the site as as asoon as access token expires new access and refresh token is set
yes a big yes
*/
const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request ")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    
        const user = await Provider.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401 , "invalid refresh token"); //frontend part can redirect to login again page
        }
        
        //if you update refresh tokens after each use or invalidate old ones when a user logs out, then this check is needed. as this makes sures user doesnt use previous refresh token which was deleted from db after logout
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "refresh token expired or used "); //frontend part can redirect to login again page
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
            new ApiResponse(
                200 , 
                {
                    accessToken , refreshToken : newRefreshToken
                },
                "Access token refreshed"
            )
        );
    } catch (error) {
        throw new ApiError(401 , error?.message || "refresh token expired");
    }
});

const updatePassword = asyncHandler(async (req , res)=>{
    const {newPassword , oldPassword} = req.body;

    const user = await Provider.findById(req.provider?._id);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401 , "Wrong password Entered ");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password updated successfully!"));
});

//for the user viewing his own profile
const getCurrentProvider = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200 , req.provider , "current user fetched successfully! "));
});

//getting user notifications
const getNotifications = asyncHandler(async (req, res) => {
    const user = await Provider.findById(req.provider._id).populate("notifications");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.notifications, "User notifications fetched successfully!"));
});


//get provider package history (the ones he posted)
const getPackageHistory = asyncHandler(async (req, res) => {
    const provider =  await Provider.findById(req.provider._id).populate("packages");

    // console.log(provider);
    return res
        .status(200)
        .json(new ApiResponse(200 , provider.packages, "User package history fetched successfully!"));
});

//for other viewers
const getProviderProfile = asyncHandler(async (req,res)=>{
    const {userName} = req.params;

    if(!userName){
        throw new ApiError(400 , "Give userName!");
    }

    const user = await Provider.findOne({userName : userName}).populate("reviews").populate("packages");

    if(!user){
        throw new ApiError(400 , "user not found!!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "user profile fetched!"))
});

const getProviderReviews = asyncHandler(async (req, res) => {
    const provider = await Provider.findById(req.params.providerId).populate("reviews");
    if (!provider) {
        throw new ApiError(404, "Provider not found!");
    }

    return res.status(200).json(new ApiResponse(200, provider.reviews, "Reviews fetched successfully!"));
});

const addReviewToProvider = asyncHandler(async (req, res) => {
    const { providerId } = req.params;
    const { rating, text } = req.body;
    const userId = req.user._id;  // User who is submitting the review

    // Validate input
    if (!rating || !text) {
        throw new ApiError(400, "Rating and review text are required!");
    }

    // Find the provider
    const provider = await Provider.findById(providerId);
    if (!provider) {
        throw new ApiError(404, "Provider not found!");
    }

    // Check if the user has been enrolled in at least one package from this provider
    const hasEnrolled = await Package.exists({
        postedBy: providerId,
        enrolled: { $elemMatch: { $eq: userId } }  // Correctly check if user is in enrolled array
    });

    if (!hasEnrolled) {
        throw new ApiError(403, "You must have enrolled in a package by this provider to leave a review!");
    }

    // Check if the user has already reviewed this provider
    const existingReview = await ReviewProvider.findOne({ user: userId, provider: providerId });
    // console.log(existingReview);
    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this provider!");
    }

    // Create a new review
    const review = await ReviewProvider.create({
        user: userId,
        provider: providerId,
        rating,
        text
    });

    // Add review to the provider
    provider.reviews.push(review._id);

    // **Incrementally update provider rating**
    const totalReviews = provider.reviews.length;
    provider.rating = ((provider.rating * (totalReviews - 1)) + rating) / totalReviews;
    
    await provider.save();

    // Ensure provider.notifications exists before pushing
    const newNotification = await Notification.create({
        recipient: providerId, // Provider's ObjectId
        recipientModel: "Provider", // Specify the model
        type: "review",
        message: "You received a new review from a customer!"
    });
    
    await provider.notifications.push(newNotification._id);

    await provider.save();

    return res.status(201).json(new ApiResponse(201, review, "Review added successfully!"));
});


export {
    registerProvider,
    loginProvider,
    logoutProvider,
    refreshAccessToken,
    updatePassword,
    getCurrentProvider,
    getPackageHistory,
    getNotifications,
    getProviderProfile,
    getProviderReviews,
    addReviewToProvider
};


// update all of them