import express from "express";
import { 
    addPackage, 
    removePackage, 
    enrollInPackage, 
    searchPackageByTag, 
    searchPackageByPrice, 
    searchPackageByDestination,
    getPackageById, 
    getPackagePage,
    markPackageComplete,
    addReviewToPackage
} from "../controllers/packageController.js";
import { protect, providerProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Routes (No authentication required)
router.route("/").get(getPackagePage);  // Fetch recent packages (No params)
router.route("/:packageId").get(getPackageById);  // Takes `req.params.packageId`
router.route("/search/tag").get(searchPackageByTag);  // Takes `req.query.tag`
router.route("/search/price").get(searchPackageByPrice);  // Takes `req.query.minPrice & req.query.maxPrice`
router.route("/search/destination").get(searchPackageByDestination);  // Takes `req.query.destination`

// Protected Routes (Require authentication)
router.route("/").post(providerProtect, addPackage);  // Takes `req.body`
router.route("/:packageId").delete(providerProtect, removePackage);  // Takes `req.params.packageId`
router.route("/enroll/:packageId").post(protect, enrollInPackage);  // Takes `req.params.packageId`
router.route("/complete/:packageId").put(providerProtect, markPackageComplete);  // Takes `req.params.packageId`
router.route("/review/:packageId").post(protect, addReviewToPackage);  // Takes `req.params.packageId`

export default router;
