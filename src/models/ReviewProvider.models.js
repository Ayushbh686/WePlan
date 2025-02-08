import mongoose from "mongoose";

const ReviewProviderSchema = new mongoose.Schema({
  user : {type : mongoose.Schema.Types.ObjectId , ref: "User"},
  provider : {type : mongoose.Schema.Types.ObjectId , ref: "Provider"},
  rating : {type : Number},
  text : {type : String}
});

export const ReviewProvider = mongoose.model("ReviewProvider" , ReviewProviderSchema);