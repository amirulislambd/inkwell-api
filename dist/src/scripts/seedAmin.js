"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middlewares/auth");
async function seedAdmin() {
    try {
        const adminData = {
            name: "Admin Super",
            email: "admin@super.com",
            role: auth_1.userRole.ADMIN,
            password: "admin123",
        };
        console.log("Checking existing admin...");
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: {
                email: adminData.email,
            },
        });
        if (existingUser) {
            throw new Error("Email already exists!");
        }
        console.log("Creating admin...");
        const signInAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: "http://localhost:4000",
            },
            body: JSON.stringify(adminData),
        });
        // Response body দেখার জন্য
        const responseData = await signInAdmin.json();
        console.log("Status:", signInAdmin.status);
        console.log("Response:", responseData);
        if (!signInAdmin.ok) {
            throw new Error(`Admin creation failed: ${signInAdmin.status}`);
        }
        console.log("Admin created successfully!");
        await prisma_1.prisma.user.update({
            where: {
                email: adminData.email,
            },
            data: {
                emailVerified: true,
            },
        });
        console.log("Admin email verified successfully!");
    }
    catch (error) {
        console.error("Admin seed failed:", error);
    }
    finally {
        await prisma_1.prisma.$disconnect();
    }
}
seedAdmin();
