import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  user : {type : mongoose.Schema.Types.ObjectId , ref: "User"},
  package : {type : mongoose.Schema.Types.ObjectId , ref: "Package"},
  rating : {type : Number},
  text : {type : String}
});

export const Review = mongoose.model("Review" , ReviewSchema);