import express from "express";
import { triggerBulkProcessing } from "../controllers/bulkController.js";
import { verifyApiToken } from "../middleware/authMiddleware.js";
import { bulkRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply middlewares: auth first, then rate limiter
router.post("/process", verifyApiToken, bulkRateLimiter, triggerBulkProcessing);

export default router;
