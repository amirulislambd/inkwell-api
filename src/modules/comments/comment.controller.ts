import { Request, Response } from "express";
import { CommentServices } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  console.log(req.user);
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "unauthorized user!",
      });
    }
    req.body.authorId = user?.id;
    const result = await CommentServices.createComment(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.log("Full Error ", error);
    res.status(400).json({
      error: "Comment created failed",
      details: error,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  console.log(req.user);
  try {
   const {commentId}=req.params

    const result = await CommentServices.getCommentById(commentId as string);
    res.status(201).json(result);
  } catch (error) {
    console.log("Full Error ", error);
    res.status(400).json({
      error: "Comment fetched failed!",
      details: error,
    });
  }
};
export const CommentController = {
  createComment,
  getCommentById
};
