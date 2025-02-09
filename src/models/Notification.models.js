// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, refPath: "recipientModel" },
  recipientModel: { type: String, required: true, enum: ["User", "Provider"] }, // Determines the referenced model
  type: { type: String, required: true },
  message: String,
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification =  mongoose.model("Notification", NotificationSchema);
