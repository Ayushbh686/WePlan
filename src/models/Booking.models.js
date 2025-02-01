import mongoose from "mongoose";


const BookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    serviceType: { 
        type: String, 
        enum: ["stay", "travel", "package"], 
        required: true 
    },
    serviceId: { 
        type: String, 
        required: true 
    }, // ID of the stay, travel option, or package (url of service)
    bookingDate: { 
        type: Date, 
        default: Date.now 
    },
    totalPrice: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, enum: ["pending", "confirmed", "cancelled"], 
        default: "pending" 
    },
});


export const Booking = mongoose.model("Booking" , BookingSchema);
