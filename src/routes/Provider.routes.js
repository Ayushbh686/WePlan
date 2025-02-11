import express from "express";
import { 
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
} from "../controllers/Provider.controllers.js";
import { verifyJWTProvider } from "../middleware/authProvider.middlewares.js";
import { verifyJWT } from "../middleware/auth.middlewares.js";

const router = express.Router();

// Public Routes (No authentication required)
router.route("/register").post(registerProvider);  // Takes `req.body`
router.route("/login").post(loginProvider);  // Takes `req.body`
router.route("/profile/:userName").get(getProviderProfile);  // Takes `req.params.userName`
router.route("/:providerId/reviews").get(getProviderReviews);  // Takes `req.params.providerId`
router.route("/packages").get(verifyJWTProvider ,getPackageHistory);  // No params

// Protected Routes (Require authentication)
router.route("/logout").get(verifyJWTProvider, logoutProvider);  // No params
router.route("/refresh-token").get(refreshAccessToken);  // Takes `req.cookies.refreshToken`
router.route("/update-password").put(verifyJWTProvider, updatePassword);  // Takes `req.body`
router.route("/me").get(verifyJWTProvider, getCurrentProvider);  // No params
router.route("/notifications").get(verifyJWTProvider, getNotifications);  // No params
router.route("/:providerId/reviews/add").post(verifyJWT , addReviewToProvider);  // Takes `req.params.providerId`

export default router;
//only package untested rest tested