import { Router } from "express";
import { getItinerary } from "../controllers/Itinerary.controllers.js";

const router = Router();

router.route("/getItinerary").post(getItinerary);

export default router;