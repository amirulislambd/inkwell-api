"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRole = void 0;
const auth_1 = require("../lib/auth");
var userRole;
(function (userRole) {
    userRole["USER"] = "USER";
    userRole["ADMIN"] = "ADMIN";
})(userRole || (exports.userRole = userRole = {}));
const authHeder = (...roles) => {
    return async (req, res, next) => {
        try {
            const session = await auth_1.auth.api.getSession({
                headers: req.headers,
            });
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are unauthorized",
                });
            }
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email Verification required, Please verify your emil!",
                });
            }
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role,
                emailVerification: session.user.emailVerified,
            };
            if (!roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You are don't access this resources.",
                });
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = authHeder;
