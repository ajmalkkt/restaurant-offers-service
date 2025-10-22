import express from "express";
import { bulkRateLimiter } from "../middleware/rateLimiter.js";
import { sendEnquiryEmail } from "../controllers/enquiryController.js"; 

const router = express.Router();

// Send enquiry email
router.post("/", bulkRateLimiter, sendEnquiryEmail);

export default router;
