import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema({
    userName: { type: String, required: true , unique : true}, 
    fullName: { type: String, required: true }, 
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed Password
    phone: { type: String, required: true },
    companyName: { type: String },
    location: { type: String },
    bio: { type: String },
    refreshToken : { type : String },
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }], // Packages offered
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "ReviewProvider" }], // Reviews on provider
    rating: { type: Number, default: 0 }, // Average rating of provider
    notifications : [ { type : mongoose.Schema.Types.ObjectId , ref : "Notification" } ]
}, { timestamps: true });

ProviderSchema.pre("save" , async function (next){
    if(!this.isModified('password')) next();
    else{
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
});

ProviderSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

ProviderSchema.methods.generateAccessToken = async function (){
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

ProviderSchema.methods.generateRefreshToken = async function (){
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

export const Provider = mongoose.model("Provider", ProviderSchema);
