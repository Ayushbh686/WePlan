import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true 
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
        type: String 
    },
    bio: { 
        type: String 
    },
    blogs: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "BlogPost" 
        }
    ], // Blogs written by the user
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
  } , {timestamps : true});

export const User = mongoose.model("User" , UserSchema);
  