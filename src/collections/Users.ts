import { CollectionConfig } from "payload/types";

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return `
        <h1>Hi </h1>
        <p>Your account has been created successfully. Please check your email to verify your account.</p>
        <a href='${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}'>verify your account</a>
        <p>If you did not create an account, please ignore this email.</p>

        <p>Regards,</p>
        <p>Abdelrhman | DigitalHippo</p>
        `;
      },
    },
  },
  access: {
    read: () => true,
    create: () => true,
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
