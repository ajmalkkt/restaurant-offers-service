import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Restaurant from "../models/Restaurant.js";
import { getNextSequence } from "../utils/getNextSequence.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addOrUpdateRestaurant = async (req, res) => {
  try {
    const { id, name, address, phone, rating, cuisine, logoUrl, brandUrl, country } = req.body;
    const saveToDB = process.env.SAVE_IMAGES_TO_DB === "true";
    const restaurantId = id || (await getNextSequence("restaurants"));

    const updateData = {
      id: restaurantId,
      name,
      address,
      phone,
      rating,
      cuisine,
      logoUrl,
      brandUrl,
      country,
    };

    // ✅ Handle logo upload
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];
      if (saveToDB) {
        updateData.logoImage = logoFile.buffer;
        updateData.logoImageType = logoFile.mimetype;
      } else {
        const folderPath = path.join(__dirname, "../uploads/restaurants");
        if (!fs.existsSync(folderPath))
          fs.mkdirSync(folderPath, { recursive: true });
        fs.writeFileSync(
          path.join(folderPath, `logo-${restaurantId}.jpg`),
          logoFile.buffer
        );
      }
    }

    // ✅ Handle brand upload
    if (req.files?.brand?.[0]) {
      const brandFile = req.files.brand[0];
      if (saveToDB) {
        updateData.brandImage = brandFile.buffer;
        updateData.brandImageType = brandFile.mimetype;
      } else {
        const folderPath = path.join(__dirname, "../uploads/restaurants");
        if (!fs.existsSync(folderPath))
          fs.mkdirSync(folderPath, { recursive: true });
        fs.writeFileSync(
          path.join(folderPath, `restaurant-${restaurantId}.jpg`),
          brandFile.buffer
        );
      }
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { id: restaurantId },
      updateData,
      { upsert: true, new: true }
    );

    res.json({ success: true, restaurant });
  } catch (err) {
    console.error("Error saving restaurant:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    // projection to exclude image buffers
    const restaurants = await Restaurant.find({},"-logoImage -logoImageType -brandImage -brandImageType" );
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const data = restaurants.map(r => ({
      ...r.toObject(),
      logoUrl: `${baseUrl}/api/restaurants/${r.id}/image/logo`,
      brandUrl: `${baseUrl}/api/restaurants/${r.id}/image/brand`
    }));

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err.message });
  }
};

export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({ id },"-logoImage -logoImageType -brandImage -brandImageType" );
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const data = {
      ...restaurant.toObject(),
      logoUrl: `${baseUrl}/api/restaurants/${restaurant.id}/image/logo`,
      brandUrl: `${baseUrl}/api/restaurants/${restaurant.id}/image/brand`
    };

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurant', error: err.message });
  }
};

// Serve restaurant images (logo or brand)
export const getRestaurantImage = async (req, res) => {
  const { id, type } = req.params;

  try {
    const restaurant = await Restaurant.findOne({ id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const saveToDB = process.env.SAVE_IMAGES_TO_DB === "true";
    const imageField = type === "logo" ? "logoImage" : "brandImage";
    const imageTypeField = type === "logo" ? "logoImageType" : "brandImageType";

    if (saveToDB) {
      const imageData = restaurant[imageField];

      // ✅ Handle both Buffer and BSON Binary types
      if (imageData) {
        const buffer =
          imageData instanceof Buffer
            ? imageData
            : imageData.buffer
            ? Buffer.from(imageData.buffer)
            : Buffer.from(imageData);

        if (!buffer || buffer.length === 0) {
          return res.status(404).json({ message: `${type} image data is empty` });
        }

        const mimeType = restaurant[imageTypeField] || "image/jpeg";
        res.setHeader("Content-Type", mimeType);
        return res.end(buffer); // ✅ safer for binary data
      } else {
        return res
          .status(404)
          .json({ message: `${type} image not found in database` });
      }
    } else {
      // ✅ Mode: File system
      const folderPath = path.join(__dirname, "../uploads/restaurants");
      const fileName = type === "logo" ? `logo-${id}.jpg` : `restaurant-${id}.jpg`;
      const filePath = path.join(folderPath, fileName);

      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      } else {
        return res
          .status(404)
          .json({ message: `${type} image not found in file system` });
      }
    }
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).json({ message: "Error fetching image", error: err.message });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOneAndDelete({ id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    // Optionally, delete associated images from file system
    const saveToDB = process.env.SAVE_IMAGES_TO_DB === "true";
    if (!saveToDB) {
      const folderPath = path.join(__dirname, "../uploads/restaurants");
      const logoPath = path.join(folderPath, `logo-${id}.jpg`);
      const brandPath = path.join(folderPath, `restaurant-${id}.jpg`);

      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
      if (fs.existsSync(brandPath)) fs.unlinkSync(brandPath);
    }

    res.json({ success: true, message: "Restaurant deleted successfully" });
  } catch (err) {
    console.error("Error deleting restaurant:", err);
    res.status(500).json({ error: err.message });
  }
};

