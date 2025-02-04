// models/Package.js
import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type :String, required : true },
  description: String,
  destination: String,
  price: Number,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  availableSlots: { type: Number, default: 1 },
  // Users who have requested to join (pending approval)
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // Users who have been accepted into the package
  enrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

export default mongoose.model("Package", PackageSchema);
