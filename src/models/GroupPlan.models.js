import mongoose from "mongoose";


const GroupPlanSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    }, // User who created the plan
    location: { 
        type: String, 
        required: true 
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    membersRequired: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String 
    },
    joinedUsers: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ], // Users who joined the plan
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
}); 

export const GroupPlan = mongoose.model("GroupPlan" , GroupPlanSchema)