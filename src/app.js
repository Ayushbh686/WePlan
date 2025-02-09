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
import UserRoutes from "./routes/User.routes.js";
import BlogRoutes from "./routes/Blog.routes.js";
import ProviderRoutes from "./routes/Provider.routes.js";

app.use("/api/itinerary" , ItineraryRoutes);
//https://localhost:8000/api/itinerary/

app.use("/api/user" , UserRoutes);
//https://localhost:8000/api/user/

app.use("/api/blog" , BlogRoutes);
//https://localhost:8000/api/blog/

app.use("/api/provider" , ProviderRoutes);
//https://localhost:8000/api/provider/

export {app};