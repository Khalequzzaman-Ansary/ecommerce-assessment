import { Router } from "express";
import { placeOrder } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, placeOrder);

export default router;