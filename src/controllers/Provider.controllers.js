import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/User.models.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async (userId)=>{
    const user = await User.findOne({_id: userId});
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave : false});

    return {accessToken ,refreshToken}
}

const registerUser = asyncHandler(async (req , res)=>{
    //take user details 
    //check validation - emoty feild 
    //check if user exists : email , username
    //check for images and avatar 
    //upload them on cloudinary
    //create user object - make entry in db 
    //remove password and refresh token from response 
    //check user creation 
    //return res

    const {fullName , email , userName , password} = req.body;
    // console.log("email : " , email);
    // console.log("req.files: ", req.files);
    if(
        [fullName , email , userName , password].some((ele) => ele?.trim() === '') // ? means if ele exists
    ){
        throw new ApiError(400 , "no feild can be empty! ");
    }

    const existedUser = await User.findOne({
        $or:[{email} , {userName}]
    }); // User.findOne({email}) for search by email only

    if(existedUser){
        throw new ApiError(409 , "User with these Username or email exists! ");
    }
    // console.log("req.files " , req.files);
    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    const user = await User.create({
        fullName : fullName,
        email : email,
        userName : userName.toLowerCase(),
        password : password
    });

    // console.log("user created : " , user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // console.log("user to be sent as response : " , createdUser);

    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering user! ");
    }

    return res.status(200).json(
        new ApiResponse(201 , createdUser , "User registered Successfully! ")
    )
});

const loginUser = asyncHandler(async(req,res)=>{
    //takes user data from req body 
    //get username or email
    //find user in db
    //match password input
    //genrate refresh token and access token 
    //send cookie

    const {userName , email , password} = req.body;

    // console.log(req.body);

    if(!(userName || email)){
        throw new ApiError(404 , "email or userName is required! ");
    }

    const user = await User.findOne({
        $or : [{email} , {userName}]
    });

    if(!user){
        throw new ApiError(404 , "user with this emial or username not found! ");
    }

    const isCorrect = await user.isPasswordCorrect(password)

    if(!isCorrect){
        throw new ApiError(400 , "Wrong password input ");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findOne({
        $or: [{ email }, { userName }]
    }).select("-password -refreshToken");

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , 
            {
                "user" : loggedInUser , accessToken , refreshToken
            },
            "used loggedIn successfully"
        )
    );
});

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1 // unset the refresh token 
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200 , 
            {
            },
            "used loggedOut successfully"
        )
    );    
})

//refresh both access and refresh token when user have valid refresh token , used when auth middle rejects access token as its expired so the system generates both new access and refresh token again , this function rotates feresh token after every use
const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request ")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401 , "invalid refresh token"); //frontend part can redirect to login again page
        }
        
        //if you update refresh tokens after each use or invalidate old ones when a user logs out, then this check is needed. as this makes sures user doesnt use previous refresh token which was deleted from db after logout
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401 , "refresh token expired or used "); //frontend part can redirect to login again page
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
            new ApiResponse(
                200 , 
                {
                    accessToken , refreshToken : newRefreshToken
                },
                "Access token refreshed"
            )
        );
    } catch (error) {
        throw new ApiError(401 , error?.message || "refresh token expired");
    }
})

const updatePassword = asyncHandler(async (req , res)=>{
    const {newPassword , oldPassword} = req.body;

    const user = await User.findById(req.user?._id);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401 , "Wrong password Entered ");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false});

    return res
    .status(200)
    .json(new ApiResponse(200 , {} , "Password updated successfully!"));
});

//for the user viewing his own profile
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "current user fetched successfully! "));
});

//getting user notifications
const getNotifications = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("notifications");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.notifications, "User notifications fetched successfully!"));
});


//get user itinerary history
const getItineraryHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("itineraries");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.itineraries, "User Itinerary history fetched successfully!"));
});


//get user package history
const getPackageHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("packages");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.packages, "User package history fetched successfully!"));
});


//get user blog history
const getBlogHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("blogs");

    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user.blogs, "User blog history fetched successfully!"));
});

//for other viewers
const getUserProfile = asyncHandler(async (req,res)=>{
    const {userName} = req.params;

    if(!userName){
        throw new ApiError(400 , "Give userName!");
    }

    const user = await User.findOne({userName : userName}).populate("blogs");

    if(!user){
        throw new ApiError(400 , "user not found!!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , user , "user profile fetched!"))
});

const getReviews = asyncHandler(async(req,res)=>{

});

const addReviewToProvider = asyncHandler(async(req,res)=>{

});

export {registerUser,
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
    getUserProfile
};

// update all of them