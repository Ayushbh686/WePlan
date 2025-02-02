import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : "*",
    credentials : true
}));

app.use(express.json());
app.use(express.urlencoded({extended : "true"}));
app.use(express.static("public"));
app.use(cookieParser());

//setting routes 
import ItineraryRoutes from "./routes/Itinerary.routes.js";

app.use("/api/itinerary" , ItineraryRoutes);
//https://localhost:8001/api/itinerary/getItinerary


export {app};