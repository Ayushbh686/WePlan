import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true ,
        unique : true
    },
    fullName : {
        type : String,
        required : true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    profilePicture: { 
        type: String, //cloudinary
        default: "" 
    },
    contact: { 
        type: String //contact number optional
    },
    bio: { 
        type: String 
    },
    refreshToken : {
        type : String
    },
    blogs: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Blog" 
        }
    ], // Blogs written by the user
    packages : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Package"
        }
    ],
    Itineraries : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Itinerary"
        }
    ]
  } , {timestamps : true});

UserSchema.pre("save" , async function (next){
    if(!this.isModified('password')) next();
    else{
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
});

UserSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

UserSchema.methods.generateAccessToken = async function (){
    return jwt.sign(
        {
            _id : this._id,
            userName : this.userName,
            email : this.email,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.methods.generateRefreshToken = async function (){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User" , UserSchema);
  