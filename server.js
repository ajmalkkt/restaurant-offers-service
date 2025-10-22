import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

import restaurantRoutes from "./routes/restaurantRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
//import { processBulkUploads } from "./middleware/bulkProcessor.js";
import bulkRoutes from "./routes/bulkRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
// Middleware and route setups: server.js-> xxxRoutes.js -> controllers/xxxController.js -> middleware/xxxMiddleware.js
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/bulk", bulkRoutes);
app.use("/api/enquiry", enquiryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Start bulk upload processor to run every 24 hours
//setInterval(() => {
  //processBulkUploads();
//}, 3600000 * 24); // every 24 hrs
