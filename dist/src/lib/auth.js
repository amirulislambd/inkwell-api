"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const prisma_2 = require("./prisma");
// import { role } from "better-auth/plugins";
// If your Prisma file is located elsewhere, you can change the path
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma_2.prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "USER",
                required: false,
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false,
            },
            phone: {
                type: "string",
                required: false,
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            accessType: "offline",
            prompt: "select_account consent",
        },
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
                const info = await transporter.sendMail({
                    from: '"Prisma Blog" <prismabloge@db.com>',
                    to: user.email,
                    subject: "Verify Your Email - Prisma Blog",
                    text: `Please verify your email by clicking this link: ${verificationUrl}`,
                    html: `
    <div style="margin:0; padding:40px 20px; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden;">

        <div style="background:#2563eb; padding:30px 20px; text-align:center;">
          <h1 style="margin:0; color:#ffffff;">
            Prisma Blog
          </h1>
        </div>

        <div style="padding:40px 30px; text-align:center;">

          <h2 style="color:#1f2937;">
            Verify Your Email Address
          </h2>

          <p style="color:#6b7280; font-size:16px; line-height:1.6;">
            Thanks for creating an account with Prisma Blog!
            Please verify your email address by clicking the button below.
          </p>

          <a
            href="${verificationUrl}"
            style="
              display:inline-block;
              padding:14px 28px;
              background:#2563eb;
              color:#ffffff;
              text-decoration:none;
              font-size:16px;
              font-weight:bold;
              border-radius:8px;
            "
          >
            Verify My Email
          </a>

          <p style="margin-top:30px; color:#9ca3af; font-size:13px;">
            If you didn't create this account, you can safely ignore this email.
          </p>

        </div>

        <div style="padding:20px; background:#f9fafb; text-align:center;">
          <p style="margin:0; color:#9ca3af; font-size:13px;">
            © 2026 Prisma Blog. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `,
                });
                console.log("Message sent: %s", info.messageId);
                // Preview URL is only available when using an Ethereal test account
                console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
            }
            catch (err) {
                console.error("Error while sending mail:", err);
            }
        },
    },
});
