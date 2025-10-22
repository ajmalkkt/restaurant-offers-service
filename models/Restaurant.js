import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  rating: { type: Number, default: 0 },
  cuisine: [{ type: String }],
  logoUrl: { type: String, required: true },
  brandUrl: { type: String },
  country: { type: String },
  logoImage:{type: Buffer},
  logoImageType: { type: String },
  brandImage: {type: Buffer},
  brandImageType: { type: String },
});

export default mongoose.model("Restaurant", restaurantSchema);
