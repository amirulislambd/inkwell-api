import express, { Router } from "express";
import { CommentController } from "./comment.controller";

import authHeder, { userRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/:commentId",
  CommentController.getCommentById
)

router.post(
  "/",
  authHeder(userRole.USER, userRole.ADMIN),
  CommentController.createComment,
);

export const commentRouter: Router = router;
