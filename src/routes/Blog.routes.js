import { addBlog, deleteBlog, addLike, addComment, searchByTag, getBlogById , getBlogPage} from "../controllers/Blog.controllers.js";
import {verifyJWT} from "../middleware/auth.middlewares.js";
import { Router } from "express";

const router = Router();

// Public Routes (No authentication required)
router.route("/searchByTag").get(searchByTag); // Takes query (req.query.tag)
router.route("/getBlogPage").get(getBlogPage); // No params or query, fetches recent blogs
router.route("/:blogId").get(getBlogById); // Takes params (req.params.blogId)

// Protected Routes (Require authentication)
router.route("/addBlog").post(verifyJWT, addBlog); // No params or query
router.route("/:blogId/delete").delete(verifyJWT, deleteBlog); // Takes params (req.params.blogId)
router.route("/:blogId/like").post(verifyJWT, addLike); // Takes params (req.params.blogId)
router.route("/:blogId/comment").post(verifyJWT, addComment); // Takes params (req.params.blogId)

export default router;