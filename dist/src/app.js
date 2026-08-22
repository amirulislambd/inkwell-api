"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_router_1 = __importDefault(require("./modules/post/post.router"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.APP_URL || "http//localhost:4000",
    credentials: true,
}));
app.use("/post", post_router_1.default);
app.use("/getAllPosts", post_router_1.default);
app.get('/', (req, res) => {
    res.send("Bismillahir Rahmanir Rahim");
});
exports.default = app;
