"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
exports.Users = {
    slug: "users",
    auth: {
        verify: {
            generateEmailHTML: function (_a) {
                var token = _a.token;
                return "\n        <h1>Hi </h1>\n        <p>Your account has been created successfully. Please check your email to verify your account.</p>\n        <a href='".concat(process.env.NEXT_PUBLIC_SERVER_URL, "/verify-email?token=").concat(token, "'>verify your account</a>\n        <p>If you did not create an account, please ignore this email.</p>\n\n        <p>Regards,</p>\n        <p>Abdelrhman | DigitalHippo</p>\n        ");
            },
        },
    },
    access: {
        read: function () { return true; },
        create: function () { return true; },
    },
    fields: [
        {
            name: "role",
            defaultValue: "users",
            required: true,
            //   admin: {
            //     // condition: ( ) => req.user.role === "admin",
            //   },
            type: "select",
            options: [
                { label: "Admin", value: "admin" },
                { label: "User", value: "user" },
            ],
        },
    ],
};
