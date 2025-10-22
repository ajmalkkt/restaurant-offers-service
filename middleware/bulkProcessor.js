import fs from "fs-extra";
import mime from "mime-types";
import path from "path";
import XLSX from "xlsx";
import Restaurant from "../models/Restaurant.js";
import Offer from "../models/Offer.js";
import { getNextSequence } from "../utils/getNextSequence.js";
import { getFilesIfExists } from "../utils/fileUtils.js";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "bulk");

export const processBulkUploads = async () => {
  try {

    console.log(` Checking for bulk upload files... Folder:${UPLOAD_DIR}`);
    
    const files = getFilesIfExists(UPLOAD_DIR);
    if (files.length === 0) {
        console.log("[BulkProcessor] No Excel files found. Skipping run.");
        return;
    }

    console.log(`[BulkProcessor] Found ${files.length} file(s):`);
    let fileCount = files.length;
    for (const file of files) {
      if (!file.endsWith(".xlsx")) {   
        console.log(`Skipping non-Excel file: ${file}`);
        fileCount--;
        continue;
      }

      const filePath = path.join(UPLOAD_DIR, file);
      console.log(`Processing file: ${filePath}`);

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (file.includes("restaurant")) {
        await importRestaurants(data);
      } else if (file.includes("offer")) {
        await importOffers(data);
      }

      // Move processed file to archive
      const archivePath = path.join(UPLOAD_DIR, "processed");
      await fs.ensureDir(archivePath);
      await fs.move(filePath, path.join(archivePath, file), { overwrite: true });

      console.log(`Finished processing ${file}`);
    }
    console.log("Bulk upload processing completed for "+fileCount+" files");
  } catch (err) {
    console.error("Error in bulk upload processor:", err);
  }
};

const importRestaurants = async (rows) => {
  for (const row of rows) {
    const {
      id,
      name,
      address,
      phone,
      rating,
      cuisine,
      country,
      logoImagePath,
      brandImagePath,
    } = row;
    //console.log(`Importing restaurant: ${row} `);
    let restaurantId = id || await getNextSequence("restaurants");

    const updateData = {
      id: restaurantId,
      name,
      address,
      phone,
      rating,
      cuisine: cuisine?.split(",").map(c => c.trim()) || [],
      country,
    };

    // Attach image files if paths exist
    if (logoImagePath && fs.existsSync(logoImagePath)) {
      const imageBuffer = fs.readFileSync(logoImagePath);
      const imageType = mime.lookup(logoImagePath); // returns 'image/png' or 'image/jpeg'
      updateData.logoImage = imageBuffer;
      updateData.logoImageType = imageType || 'application/octet-stream';
    }
    //currently showing brand image in popular brand section
    if (brandImagePath && fs.existsSync(brandImagePath)) {
      const imageBuffer = fs.readFileSync(brandImagePath);
      const imageType = mime.lookup(brandImagePath); 
      updateData.brandImage = imageBuffer;//fs.readFileSync(brandImagePath);
      updateData.brandImageType = imageType || 'application/octet-stream';
    } else {
      console.warn(`⚠️ Brand image not found at path: ${brandImagePath}`);
      return;
    }

    await Restaurant.findOneAndUpdate(
      { id: restaurantId },
      updateData,
      { upsert: true, new: true }
    );
  }
};

const importOffers = async (rows) => {
  for (const row of rows) {
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
      imagePath,
    } = row;

    let offerId = id || await getNextSequence("offers");

    const updateData = {
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

    if (imagePath && fs.existsSync(imagePath)) {
      //updateData.image = fs.readFileSync(imagePath);
      //updateData.imageType = "image/jpeg";
        const imageBuffer = fs.readFileSync(imagePath);
        const imageType = mime.lookup(imagePath); // returns 'image/png' or 'image/jpeg'
        updateData.image = imageBuffer;
        updateData.imageType = imageType || 'application/octet-stream';
    } else {
      console.warn(`⚠️ Offer image not found at path: ${imagePath}`);
      return;
    }

    await Offer.findOneAndUpdate(
      { id: offerId },
      updateData,
      { upsert: true, new: true }
    );
  }
};
