import { PrimaryActionEmailHtml } from "../components/emails/PrimaryActionEmail";
import { Access, CollectionConfig } from "payload/types";

const adminsAndUser: Access = ({ req: { user } }) => {
  if (user.role === "admin") return true;

  return {
    id: {
      equals: user.id,
    },
  };
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {

        return PrimaryActionEmailHtml({
          actionLabel:"verify your account",
          buttonText:"Verify Account",
          href:`${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`
        })
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
    read: adminsAndUser,
    create: () => true,
    update: ({ req }) => req.user.role === "admin",
    delete: ({ req }) => req.user.role === "admin",
  },
  admin:{
    hidden: ({user})=> user.role !== "admin",
    defaultColumns:["id"]
  },
  fields: [
    {
      name: "products",
      label: "Products",
      admin: {
        condition: () => false,
      },
      type: "relationship",
      relationTo: "products",
      hasMany: true,
    },
    {
      name: "product_files",
      label: "Products files",
      admin: {
        condition: () => false,
      },
      type: "relationship",
      relationTo: "product_files",
      hasMany: true,
    },
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
