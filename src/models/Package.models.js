import mongoose from "mongoose";


const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type :String, required : true },
  description: String,
  destination: [{type : String}],
  price: Number,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" },
  IsCompleted : {type : Boolean , default : false},
  availableSlots: { type: Number, default: 1 },
  tags : [{type : String}],
  // Users who have been accepted into the package
  enrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reviews : [{type : mongoose.Schema.Types.ObjectId , ref: "Review"}]
}, { timestamps: true });

export default Package = mongoose.model("Package", PackageSchema);
