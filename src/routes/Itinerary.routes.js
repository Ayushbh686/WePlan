import { Router } from "express";
import { addItinerary, AIchat, getHotels, getItinerary } from "../controllers/Itinerary.controllers.js";
import { verifyJWT } from "../middleware/auth.middlewares.js";

const router = Router();

//check them all after making user routes and controllers
router.route("/getItinerary").post(verifyJWT , getItinerary);
router.route("/getHotels").post(verifyJWT, getHotels);
router.route("/addItinerary").post(verifyJWT , addItinerary);
router.route("/AIchat").post(verifyJWT , AIchat);

export default router;
