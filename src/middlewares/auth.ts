import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

const requireEmailVerification =
  process.env.NODE_ENV === "production" ||
  process.env.REQUIRE_EMAIL_VERIFICATION === "true";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role?: string;
        emailVerification: boolean;
      };
    }
  }
}

export enum userRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

const authHeder = (...roles: userRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: new Headers(req.headers as Record<string, string>),
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are unauthorized",
        });
      }

      if (requireEmailVerification && !session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email Verification required, Please verify your email!",
        });
      }

      const authenticatedUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role:
          typeof session.user.role === "string"
            ? session.user.role.toUpperCase()
            : undefined,
        emailVerification: session.user.emailVerified,
      };
      req.user = authenticatedUser;

      if (
        roles.length > 0 &&
        !roles.includes(authenticatedUser.role as userRole)
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden! You don't have access to this resource.",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default authHeder;