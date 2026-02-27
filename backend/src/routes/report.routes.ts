import { Router } from "express";
import { getReportSummary } from "../controllers/report.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminMiddleware } from "../middlewares/admin.middleware";

const router = Router();

router.get("/summary", authMiddleware, adminMiddleware, getReportSummary);

export default router;