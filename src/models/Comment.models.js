import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  blog : {type : mongoose.Schema.Types.ObjectId , ref : "Blog"},
  createdAt: { type: Date, default: Date.now }
});

export const Comment = mongoose.model("Comment" , CommentSchema);