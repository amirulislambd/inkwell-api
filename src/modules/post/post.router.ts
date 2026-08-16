import express, { Router } from "express";
import { PostController } from "./post.controller";
import authHeder, { userRole } from "../../middlewares/auth";
const router = express.Router();

router.post("/", authHeder(userRole.USER), PostController.createPost);

router.get("/", PostController.getAllPost);

router.get("/:postId", PostController.getPostById);

export const postRouter: Router = router;
