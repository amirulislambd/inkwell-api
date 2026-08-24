import { Request, Response } from "express";
import { PostStatus } from "../../../generated/prisma/enums";
import { PostService } from "./post.service";
import paginationSortingHelper from "../../helper/paginationSortingHelper";
import { userRole } from "@/src/middlewares/auth";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "unauthorized user!" });
    }

    const result = await PostService.createPost(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Full Error", error);
    return res.status(400).json({
      error: "Post creation failed",
      details: error,
    });
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const tags =
      typeof req.query.tags === "string" ? req.query.tags.split(",") : [];
    const isFeatured =
      req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined;
    const status =
      typeof req.query.status === "string"
        ? (req.query.status as PostStatus)
        : undefined;
    const authorId =
      typeof req.query.authorId === "string" ? req.query.authorId : undefined;
    const { page, limit, skip, sortBy, orderBy } = paginationSortingHelper(
      req.query,
    );

    const result = await PostService.getAllPosts({
      search,
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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Full Error", error);
    return res.status(400).json({ error: "Get posts failed", details: error });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    if (!postId || Array.isArray(postId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post id" });
    }

    const result = await PostService.getPostById(postId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Full Error", error);
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Get post failed",
    });
  }
};
const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "You are unauthorized!",
      });
    }
    const result = await PostService.getMyPosts(user.id);
    return res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Get post fetched failed",
      details: error,
    });
  }
};
const updatePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "You are unauthorized!",
      });
    }
    const { postId } = req.params;
    const isAdmin = user.role === userRole.ADMIN;
    const result = await PostService.updatePost(
      postId as string,
      req.body,
      user.id,
      isAdmin,
    );
    return res.status(200).json({
      success: true,
      message: "Post update successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Update post failed",
      details: error,
    });
  }
};
const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "You are unauthorized!",
      });
    }
    const { postId } = req.params;
    const isAdmin = user.role === userRole.ADMIN;
    const result = await PostService.deletePost(
      postId as string,
      user.id,
      isAdmin,
    );
    return res.status(200).json({
      success: true,
      message: "Post Delete successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Delete post failed",
      details: error,
    });
  }
};

export const PostController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
};
