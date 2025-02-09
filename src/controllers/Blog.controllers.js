import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.models.js";
import Blog from "../models/Blog.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Notification} from "../models/Notification.models.js";
import { Comment } from "../models/Comment.models.js";



const addBlog = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;

    if (!title?.trim() || !content?.trim() || !Array.isArray(tags) || tags.length === 0) {
        throw new ApiError(400, "Title, content, and tags are required!");
    }

    const newBlog = await Blog.create({
        title,
        content,
        tags,
        author: req.user._id
    });

    await User.findByIdAndUpdate(req.user._id, {
        $push: { blogs: newBlog._id }
    }, { new: true, validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, newBlog, "Blog posted successfully"));
});



const deleteBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!blogId) throw new ApiError(400, "Blog ID is required!");

    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found!");

    if (blog.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this blog!");
    }

    await Blog.findByIdAndDelete(blogId);
    await User.findByIdAndUpdate(req.user._id, { $pull: { blogs: blogId } });

    return res.status(200).json(new ApiResponse(200, null, "Blog deleted successfully!"));
});



const addLike = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!blogId) throw new ApiError(400, "Blog ID is required!");

    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found!");

    if (blog.likes.includes(req.user._id)) {
        throw new ApiError(400, "You have already liked this blog!");
    }

    blog.likes.push(req.user._id);
    await blog.save();

    // Send notification to blog author
    const notify = await Notification.create({
        user: blog.author,
        recipientModel : "User",
        message: `Your blog "${blog.title}" got liked by ${req.user?.userName}`,
        type: "Blog Liked"
    });

    await User.findByIdAndUpdate(blog.author, { $push: { notifications: notify._id } });

    return res.status(200).json(new ApiResponse(200, null, "Blog liked successfully!"));
});



const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { blogId } = req.params;

    if (!content?.trim() || !blogId) {
        throw new ApiError(400, "Blog ID and content required!");
    }

    const blog = await Blog.findById(blogId);
    if (!blog) throw new ApiError(404, "Blog not found!");

    const comment = await Comment.create({
        user: req.user._id,
        text: content,
        blog: blogId
    });

    blog.comments.push(comment._id);
    await blog.save();

    // Send notification to blog author
    const notify = await Notification.create({
        user: blog.author,
        recipientModel : "User",
        message: `User ${req.user?.userName} commented on your blog "${blog.title}"`,
        type: "Blog Commented"
    });

    await User.findByIdAndUpdate(blog.author, { $push: { notifications: notify._id } });

    return res.status(200).json(new ApiResponse(200, null, "Comment added successfully!"));
});



const searchByTag = asyncHandler(async (req, res) => {
    const { tag } = req.query;

    if (!tag?.trim()) throw new ApiError(400, "Tag is required!");

    const blogs = await Blog.find({ tags: { $in: [tag] } }).populate("author" , "fullName userName avatar");

    if (blogs.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No blogs found for this tag."));
    }

    return res.status(200).json(new ApiResponse(200, blogs, "Blogs fetched successfully!"));
});



const getBlogById = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    if (!blogId) throw new ApiError(400, "Blog ID is required!");

    const blog = await Blog.findById(blogId)
        .populate("author", "fullName userName avatar")
        .populate({
            path: "comments",
            populate: {
                path: "user",
                select: "fullName userName avatar"
            }
        });

    if (!blog) throw new ApiError(404, "Blog not found!");

    // Add likes count
    const likesCount = blog.likes.length;

    return res.status(200).json(new ApiResponse(200, { ...blog.toObject(), likesCount }, "Blog fetched successfully!"));
});

const getBlogPage = asyncHandler(async (req, res) => {
    const recentBlogs = await Blog.find()
        .sort({ createdAt: -1 }) 
        .limit(5) 
        .populate("author", "fullName userName avatar");

    return res.status(200).json(new ApiResponse(200, recentBlogs, "Recent blogs fetched successfully!"));
});


export { addBlog, deleteBlog, addLike, addComment, searchByTag, getBlogById , getBlogPage};
