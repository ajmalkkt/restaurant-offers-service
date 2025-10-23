import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import restaurantRoutes from "./routes/restaurantRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import bulkRoutes from "./routes/bulkRoutes.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Allow only your frontend origin
const allowedOrigins = [
  "https://dine-deals-dot-browseqatar.el.r.appspot.com", // React frontend on App Engine
  "http://localhost:3000", // Optional: for local development
  "http://127.0.0.1:3000","http://localhost:5173", // Optional: for local development
  "http://127.0.0.1:5173",
  "null", // For local HTML file opened via file:// (origin 'null')
];
//app.use(cors({ origin: "*" }));  // For testing purposes only
const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      // Check if the origin is not in the allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: Access from origin ${origin} not allowed`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-api-token",
      "X-Requested-With",
      "Accept"    
    ],
    optionsSuccessStatus: 204, // for legacy browsers
};
app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

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
