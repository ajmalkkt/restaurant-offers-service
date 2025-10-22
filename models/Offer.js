import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  restaurantId: { type: Number, required: true },
  cuisine: { type: String },
  originalPrice: { type: Number },
  discountedPrice: { type: Number },
  offerType: { type: String },
  validFrom: { type: Date },
  validTo: { type: Date },
  imageUrl: { type: String },
  location: { type: String },
  country: { type: String },
  category: { type: String },
  image: { type: Buffer },
  imageType: { type: String }
});

export default mongoose.model("Offer", offerSchema);
