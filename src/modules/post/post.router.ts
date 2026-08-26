import express, { Router } from "express";
import { PostController } from "./post.controller";
import authHeder, { userRole } from "../../middlewares/auth";
const router = express.Router();

router.get("/", PostController.getAllPost);

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
router.get("/stats", authHeder(userRole.ADMIN), PostController.getStats);

router.patch(
  "/:postId",
  authHeder(userRole.USER, userRole.ADMIN),
  PostController.updatePost,
);
router.delete(
  "/:postId",
  authHeder(userRole.USER, userRole.ADMIN),
  PostController.deletePost,
);

router.get("/:postId", PostController.getPostById);

export const postRouter: Router = router;
