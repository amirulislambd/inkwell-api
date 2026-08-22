"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const post_service_1 = require("./post.service");
const paginationSortingHelper_1 = __importDefault(require("../../helper/paginationSortingHelper"));
const createPost = async (req, res) => {
    console.log(req.user);
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "unauthorized user!",
            });
        }
        const result = await post_service_1.PostService.createPost(req.body, user.id);
        res.status(201).json(result);
    }
    catch (error) {
        console.log("Full Error ", error);
        res.status(400).json({
            error: "Post created failed",
            details: error,
        });
    }
};
const getAllPost = async (req, res) => {
    try {
        const { search } = req.query;
        const searchPost = typeof search === "string" ? search : undefined;
        const tags = req.query.tags ? req.query.tags.split(",") : [];
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === "true"
                ? true
                : req.query.isFeatured === "false"
                    ? false
                    : undefined
            : undefined;
        const status = req.query.status;
        const authorId = req.query.authorId;
        const { page, limit, skip, sortBy, orderBy } = (0, paginationSortingHelper_1.default)(req.query);
        const result = await post_service_1.PostService.getAllPosts({
            search: searchPost,
            tags,
            isFeatured,
            status,
            authorId,
            page,
            limit,
            skip,
            sortBy,
            orderBy,
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.log("Full Error ", error);
        res.status(400).json({
            error: "Get pots failed",
            details: error,
        });
    }
};
const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        if (!postId || Array.isArray(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid post id",
            });
        }
        const result = (await post_service_1.PostService.getPostById(postId));
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Post retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        console.log("Full Error ", error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Get post failed",
        });
    }
};
exports.PostController = {
    createPost,
    getAllPost,
    getPostById,
};
