import Offer from "../models/Offer.js";
import { getNextSequence } from "../utils/getNextSequence.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

//process.cwd() = where the Node app is executed from
//__dirname = where the current script file resides.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create or update an offer
 */
export const addOrUpdateOffer = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      restaurantId,
      cuisine,
      originalPrice,
      discountedPrice,
      offerType,
      validFrom,
      validTo,
      location,
      country,
      category,
    } = req.body;

    const offerId = id || (await getNextSequence("offers"));
    const saveToDB = process.env.SAVE_IMAGES_TO_DB === "true";

    let updateData = {
      id: offerId,
      title,
      description,
      restaurantId,
      cuisine,
      originalPrice,
      discountedPrice,
      offerType,
      validFrom,
      validTo,
      location,
      country,
      category,
    };

    // ===== Handle image upload =====
    if (req.file) {
      if (saveToDB) {
        // ✅ Save image in MongoDB
        updateData.image = req.file.buffer;
        updateData.imageType = req.file.mimetype;
      } else {
        // ✅ Save image to filesystem
        const folderPath = path.join(__dirname, "../uploads/offers");
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
        const filePath = path.join(folderPath, `offer-${offerId}.jpg`);
        fs.writeFileSync(filePath, req.file.buffer);
      }
    }

    // ===== Upsert (update or insert new) =====
    const offer = await Offer.findOneAndUpdate({ id: offerId }, updateData, {
      upsert: true,
      new: true,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/api/offers/${offerId}/image`;

    offer.imageUrl = imageUrl;
    await offer.save();

    res.status(200).json({ success: true, offer });
  } catch (err) {
    console.error("Error saving offer:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all offers
 */
export const getAllOffers = async (req, res) => {
  try {
    // Exclude `image` and `imageType` fields
    const offers = await Offer.find({}, "-image -imageType");
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = offers.map((o) => ({
      ...o.toObject(),
      imageUrl: `${baseUrl}/api/offers/${o.id}/image`,
    }));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching offers", error: err.message });
  }
};

/**
 * Get all offers by restaurant
 */
export const getOffersByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const offers = await Offer.find({ restaurantId: Number(restaurantId) },"-image -imageType");
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = offers.map((o) => ({
      ...o.toObject(),
      imageUrl: `${baseUrl}/api/offers/${o.id}/image`,
    }));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching offers", error: err.message });
  }
};

export const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOne({ id },"-image -imageType");
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = {
      ...offer.toObject(),
      imageUrl: `${baseUrl}/api/offers/${offer.id}/image`,
    };

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching offer", error: err.message });
  }
};

/**
 * Serve offer image — from DB or filesystem
 */
export const getOfferImage = async (req, res) => {
  const { id } = req.params;

  try {
    const offer = await Offer.findOne({ id });
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const saveToDB = process.env.SAVE_IMAGES_TO_DB === "true";

    if (saveToDB) {
      // 🧩 Handle cases where Mongo stores Buffer as object with .data[]
      const imageField = offer.image;
      if (imageField) {
        let imageBuffer;

        // Case 1: Direct Buffer
        if (Buffer.isBuffer(imageField)) {
          imageBuffer = imageField;
        }
        // Case 2: Stored as { data: [...], type: 'Buffer' }
        else if (imageField.data) {
          imageBuffer = Buffer.from(imageField.data);
        }

        if (imageBuffer) {
          res.contentType(offer.imageType || "image/jpeg");
          return res.send(imageBuffer);
        }
      }

      return res.status(404).json({ message: "Image not found in database" });
    } else {
      // 📂 Serve from file system
      const folderPath = path.join(__dirname, "../uploads/offers");
      const filePath = path.join(folderPath, `offer-${id}.jpg`);

      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      } else {
        return res.status(404).json({ message: "Image not found in file system" });
      }
    }
  } catch (err) {
    console.error("Error fetching offer image:", err);
    res.status(500).json({ message: "Error fetching image", error: err.message });
  }
};


/**
 * Delete offer
 */
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findOneAndDelete({ id });
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Delete image file if saved on disk
    const saveToDB = process.env.SAVE_IMAGES_TO_DB === "true";
    if (!saveToDB) {
      const filePath = path.join(__dirname, "../uploads/offers", `offer-${id}.jpg`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: "Offer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
