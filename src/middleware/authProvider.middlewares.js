import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken";
import {Provider} from "../models/Provider.models.js";

export const verifyJWTProvider = asyncHandler(async (req , res , next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , ""); // incase of mobile app we get header for token
        
        if(!token){
            throw new ApiError(401 , "unauthorized request")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
    
        const provider = await Provider.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!provider){
            throw new ApiError(401 , "Invalid access token ");
        }
    
        req.provider = provider;
        next();
    } catch (error) {
        throw new ApiError(401 , "Invalid access token ")
    }
});

export {verifyJWTProvider};