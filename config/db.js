import mongoose from "mongoose";
import crypto from "crypto";

const algorithm = "aes-256-cbc";

const decryptPassword = (encryptedPassword, ivHex, secretKey) => {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const connectDB = async () => {
  try {
    const decryptedPass = decryptPassword(
      process.env.MONGO_PASS_ENC,
      process.env.MONGO_IV,
      process.env.MONGO_SECRET_KEY
    );

    const mongoURI = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(
      decryptedPass
    )}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
