import express from "express";

import cors from "cors";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { commentRouter } from "./modules/comments/comment.router";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.APP_URL || "http//localhost:4000",
    credentials: true,
  }),
);
app.all("/api/auth/*splat", toNodeHandler(auth));
// app.use("/post", router)

app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.get('/',(req,res)=>{
    res.send("Bismillahir Rahmanir Rahim")
})


export default app;
