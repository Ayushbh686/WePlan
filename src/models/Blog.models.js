import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    }, // Title of the blog post
    content: { 
        type: String, 
        required: true 
    }, // Content of the blog post
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }, // User who wrote the blog
    location: { 
        type: String 
    }, // Location the blog is about
    tags: [
        { 
            type: String 
        }
    ], // Tags for categorization (e.g., "adventure", "budget travel")
    images: [
        { 
            type: String 
        }
    ], // URLs to images in the blog
    likes: [
        { type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ], // Users who liked the blog
    /*
    comments: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }
    ], // Comments on the blog
    */ // to be added later
    createdAt: { 
        type: Date, 
        default: Date.now 
    }, // Timestamp of creation
    updatedAt: { 
        type: Date,
        default: Date.now 
    } // Timestamp of last update
});

export const Blog = mongoose.model("Blog" , BlogPostSchema);