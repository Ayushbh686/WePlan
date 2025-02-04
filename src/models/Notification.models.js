// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["package_request", "package_response", "blog_comment", "blog_like"], required: true },
  message: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", NotificationSchema);
