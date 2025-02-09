import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middlewares.js";
import {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateAccountDetials,
    getItineraryHistory,
    getPackageHistory,
    getBlogHistory,
    getNotifications,
    getUserProfile} from "../controllers/User.controllers.js";

const router = Router();

// Public Routes (No authentication required) 
router.route("/register").post(registerUser);  // Register a new user
router.route("/login").post(loginUser);  // Login user
router.route("/refresh-token").get(refreshAccessToken);  // Refresh access token

// Profile Routes 
router.route("/profile/:userName").get(getUserProfile);  // Get user profile by username
    
// Protected Routes (Require authentication) 
router.use(verifyJWT);  // Middleware to protect routes
    
router.route("/logout").get(logoutUser);  // Logout user
router.route("/update-password").put(updatePassword);  // Update user password
router.route("/me").get(getCurrentUser);  // Get current logged-in user profile
router.route("/update-profile").put(updateAccountDetials);  // Update user account details
    
// User Data & History 
router.route("/itineraries").get(getItineraryHistory);  // Get user itinerary history
router.route("/packages").get(getPackageHistory);  // Get user package history
router.route("/blogs").get(getBlogHistory);  // Get user blog history
router.route("/notifications").get(getNotifications);  // Get user notifications
    
    
export default router;