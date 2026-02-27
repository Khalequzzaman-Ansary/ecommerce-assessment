import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "5000",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!env.mongoUri) {
  throw new Error("MONGODB_URI is missing in .env");
}

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is missing in .env");
}