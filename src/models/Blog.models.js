// models/Blog.js
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [String],
  tags: [String], // Hashtags
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{type : mongoose.Schema.Types.ObjectId , ref : "Comment"}]
}, { timestamps: true });

export default mongoose.model("Blog", BlogSchema);
