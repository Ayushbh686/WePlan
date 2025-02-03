import { Router } from "express";
import { getHotels, getItinerary } from "../controllers/Itinerary.controllers.js";

const router = Router();

router.route("/getItinerary").post(getItinerary);
router.route("/getHotels").post(getHotels);

export default router;