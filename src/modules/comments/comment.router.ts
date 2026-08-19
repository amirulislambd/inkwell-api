import express, { Router } from "express";
import { CommentController } from "./comment.controller";

import authHeder, { userRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/author/:authorId", CommentController.getCommentByAuthorId);
router.get("/:commentId",
  CommentController.getCommentById
)

router.post(
  "/",
  authHeder(userRole.USER, userRole.ADMIN),
  CommentController.createComment,
);

router.delete(
  "/:commentId",
  authHeder(userRole.USER, userRole.ADMIN),
  CommentController.deleteComment,
);
router.patch(
  "/:commentId",
  authHeder(userRole.USER, userRole.ADMIN),
  CommentController.updateComment,
);
router.patch(
  "/:commentId/moderate",
  authHeder(userRole.ADMIN),
  CommentController.moderateComment,
);

export const commentRouter: Router = router;
