import express from "express";
import { bulkRateLimiter } from "../middleware/rateLimiter.js";
import { sendEnquiryEmail, getEnquiries, getEnquiriesByPage } from "../controllers/enquiryController.js"; 
import { verifyApiToken } from "../middleware/authMiddleware.js";   

const router = express.Router();

// Send enquiry email
router.post("/", bulkRateLimiter, sendEnquiryEmail);
// Additional route to get all enquiries (for admin use)
router.get("/", verifyApiToken, getEnquiries);
router.get("/paginated", verifyApiToken, getEnquiriesByPage);

export default router;
