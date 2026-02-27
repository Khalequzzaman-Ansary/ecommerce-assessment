import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type TokenPayload = {
  userId: string;
  role: "user" | "admin";
};

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};