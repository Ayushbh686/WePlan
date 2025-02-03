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
import UserRoutes from "./routes/User.routes.js"

app.use("/api/itinerary" , ItineraryRoutes);
//https://localhost:8001/api/itinerary/

app.use("/api/user" , UserRoutes);
//https://localhost:8001/api/user/
export {app};