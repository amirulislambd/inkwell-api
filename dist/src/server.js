"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("better-auth/node");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const auth_1 = require("./lib/auth");
const PORT = process.env.PORT || 5000;
async function main() {
    try {
        await prisma_1.prisma.$connect();
        console.log("Connected to DATABASE Successfully");
        app_1.default.all("/api/auth/*splat", (0, node_1.toNodeHandler)(auth_1.auth));
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("an error occurred", error);
        await prisma_1.prisma.$disconnect;
        process.exit(1);
    }
}
main();
