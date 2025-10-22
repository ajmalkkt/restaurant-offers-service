import express from "express";
import upload from "../middleware/upload.js";
import { verifyApiToken } from "../middleware/authMiddleware.js";
import {
  addOrUpdateRestaurant,
  getAllRestaurants,
  getRestaurantImage,
  getRestaurantById,
  deleteRestaurant,
} from "../controllers/restaurantController.js";  // ✅ include .js extension in ESM

const router = express.Router();

// Create or update a restaurant
//router.post("/", upload.single("logo"), addOrUpdateRestaurant);
router.post("/", verifyApiToken, upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "brand", maxCount: 1 },
  ]), addOrUpdateRestaurant);
//router.post("/", addOrUpdateRestaurant);

// Get all restaurants
router.get("/", getAllRestaurants);

// Get a restaurant’s image (logo or brand)
router.get("/:id/image/:type", getRestaurantImage);
router.get("/:id", getRestaurantById);
router.delete("/:id", verifyApiToken, deleteRestaurant);

export default router;
