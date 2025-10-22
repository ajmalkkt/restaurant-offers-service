import express from "express";
import upload from "../middleware/upload.js";
import { verifyApiToken } from "../middleware/authMiddleware.js";
import {
  addOrUpdateOffer,
  getAllOffers,
  getOfferById,
  getOffersByRestaurant,
  getOfferImage,
  deleteOffer
} from "../controllers/offerController.js";

const router = express.Router();

router.post("/", verifyApiToken, upload.single("image"), addOrUpdateOffer);
router.get("/", getAllOffers);
router.get("/:id", getOfferById);
router.get("/:restaurantId/restaurant", getOffersByRestaurant);
router.get("/:id/image", getOfferImage);
router.delete("/:id", verifyApiToken, deleteOffer);

export default router;
