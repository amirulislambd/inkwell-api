import express, { Router } from "express";
import { PostController } from "./post.controller";
import authHeder, { userRole } from "../../middlewares/auth";
const router = express.Router();

router.post(
  "/",
  authHeder(userRole.USER, userRole.ADMIN),
  PostController.createPost,
);
router.get(
  "/my-posts",
  authHeder(userRole.USER, userRole.ADMIN),
  PostController.getMyPosts,
);

router.patch(
  "/:postId",
  authHeder(userRole.USER, userRole.ADMIN),
  PostController.updatePost,
);

router.get("/:postId", PostController.getPostById);

export const postRouter: Router = router;
