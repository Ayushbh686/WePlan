import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // User who created the package
    name: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true 
    },
    members : {
        type : Number,
        required : true
    },
    date : {
        type : String,
        required : true
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String 
    },
    inclusions: [
        { 
            type: String 
        }
    ], // What's included
    images: [
        { 
            type: String 
        }
    ], // URLs to images
    rating: { 
        type: Number, 
        default: 0 
    },
    reviews: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Review" 
        }
    ],
    createdAt: { type: Date, default: Date.now },
});

export const Package = mongoose.model("Package" , PackageSchema)
  