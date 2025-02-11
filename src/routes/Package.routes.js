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
} from "../controllers/Package.controllers.js";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import { verifyJWTProvider } from "../middleware/authProvider.middlewares.js";

const router = express.Router();

// Public Routes (No authentication required)
router.route("/getPackagePage").get(getPackagePage);  // Fetch recent packages (No params)
router.route("/searchByTag").get(searchPackageByTag);  // Takes `req.query.tag`
router.route("/searchByPrice").get(searchPackageByPrice);  // Takes `req.query.minPrice & req.query.maxPrice`
router.route("/searchByDestination").get(searchPackageByDestination);  // Takes `req.query.destination`

// Protected Routes (Require authentication) (except package Id)
router.route("/addPackage").post(verifyJWTProvider, addPackage);  // Takes `req.body`
router.route("/:packageId").get(getPackageById);  // Takes `req.params.packageId`
router.route("/:packageId/delete").delete(verifyJWTProvider, removePackage);  // Takes `req.params.packageId`
router.route("/:packageId/enroll").post(verifyJWT, enrollInPackage);  // Takes `req.params.packageId`
router.route("/:packageId/complete").put(verifyJWTProvider, markPackageComplete);  // Takes `req.params.packageId`
router.route("/:packageId/reviews/add").post(verifyJWT, addReviewToPackage);  // Takes `req.params.packageId`

export default router;
