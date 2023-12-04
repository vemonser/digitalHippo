import {
  AfterChangeHook,
  BeforeChangeHook,
} from "payload/dist/collections/config/types";
import { PRODUCTS_CATEGORIES } from "../../config";
import { Access, CollectionConfig } from "payload/types";
import { Product, User } from "../../payload-types";
import { stripe } from "../../lib/stripe";

const addUser: BeforeChangeHook<Product> = async ({ req, data }) => {
  const user = req.user;
  return { ...data, user: user.id };
};

const syncUser: AfterChangeHook<Product> = async ({ req, doc }) => {
  const fullUser = await req.payload.findByID({
    collection: "users",
    id: req.user.id,
  });
  if (fullUser && typeof fullUser === "object") {
    const { products } = fullUser;
    const allIds = [
      ...(products?.map((product) =>
        typeof product === "object" ? product.id : product
      ) || []),
    ];

    const createdProductsIds = allIds.filter(
      (id, index) => allIds.indexOf(id) === index
    );
    const dataToUpdate = [...createdProductsIds, doc.id];

    await req.payload.update({
      collection: "users",
      id: fullUser.id,
      data: {
        products: dataToUpdate,
      },
    });
  }
};

const isAdminOrHasAccess =
  (): Access =>
  ({ req: { user: _user } }) => {
    const user = _user as User | undefined;

    if (!user) return false;
    if (user.role === "admin") return true;

    const userProductIds = (user.products || []).reduce<Array<string>>(
      (acc, products) => {
        if (!products) return acc;
        if (typeof products === "string") {
          acc.push(products);
        } else {
          acc.push(products.id);
        }
        return acc;
      },
      []
    );
    return {
      id: {
        in: userProductIds,
      },
    };
  };

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    useAsTitle: "name",
  },
  access: {
    read: isAdminOrHasAccess(),
    update: isAdminOrHasAccess(),
    delete: isAdminOrHasAccess(),
  },
  hooks: {
    afterChange: [syncUser],
    beforeChange: [
      addUser,
      async (args) => {
        if (args.operation === "create") {
          const data = args.data as Product;
          const createProduct = await stripe.products.create({
            name: data.name,
            default_price_data: {
              currency: "USD",
              unit_amount: Math.round(data.price * 100),
            },
          });
          const update: Product = {
            ...data,
            stripeId: createProduct.id,
            priceId: createProduct.default_price as string,
          };
          return update;
        } else if (args.operation === "update") {
          const data = args.data as Product;

          const updatedProduct = await stripe.products.update(data.stripeId!, {
            name: data.name,
            default_price: data.priceId!,
          });
          const update: Product = {
            ...data,
            stripeId: updatedProduct.id,
            priceId: updatedProduct.default_price as string,
          };
          return update;
        }
      },
    ],
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
      hasMany: false,
      admin: {
        condition: () => false,
      },
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      label: "Product description",
      type: "textarea",
      required: true,
    },
    {
      name: "price",
      label: "Price in USD",
      min: 0,
      max: 1000,
      type: "number",
      required: true,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: PRODUCTS_CATEGORIES.map(({ label, value }) => ({
        label,
        value,
      })),
      required: true,
    },
    {
      name: "product_files",
      label: "Product file",
      type: "relationship",
      required: true,
      relationTo: "product_files",
      hasMany: false,
    },
    {
      name: "approvedForSales",
      label: "Product Status",
      type: "select",
      defaultValue: "pending",
      access: {
        create: ({ req }) => req.user.role === "admin",
        read: ({ req }) => req.user.role === "admin",
        update: ({ req }) => req.user.role === "admin",
      },
      options: [
        {
          label: "Pending ",
          value: "pending",
        },
        {
          label: "Approved ",
          value: "approved",
        },
        {
          label: "Denied ",
          value: "denied",
        },
      ],
    },
    {
      name: "priceId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      type: "text",
    },
    {
      name: "stripeId",
      access: {
        create: () => false,
        read: () => false,
        update: () => false,
      },
      admin: {
        hidden: true,
      },
      type: "text",
    },
    {
      name: "images",
      type: "array",
      label: "products Images",
      minRows: 1,
      maxRows: 7,
      required: true,
      labels: {
        singular: "Image",
        plural: "Images",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
