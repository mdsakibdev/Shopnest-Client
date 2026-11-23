import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

// Use ONE shared MongoDB client for the whole app.
// (Learned from FixMate: a new client on every load piles up
// connections until Atlas blocks sign-in.)
const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

const client =
  globalForMongo.mongoClient ??
  new MongoClient(process.env.MONGODB_URI as string, {
    maxPoolSize: 10,
    maxIdleTimeMS: 60000,
  });
globalForMongo.mongoClient = client;

const db = client.db("shopnest");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Everyone who signs up is a customer.
          // Admin is never created by signup — it is made by hand in the database.
          return {
            data: {
              ...user,
              role: "customer",
            },
          };
        },
      },
    },
  },
  plugins: [jwt()],
});
