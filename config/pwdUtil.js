// encrypt-password.js
import crypto from "crypto";

// Use a strong 32-byte key and 16-byte IV
const algorithm = "aes-256-cbc";
const secretKey = "merakiSecretKeyForBrowseQtr!1234"; // store this securely, e.g., in .env
const iv = crypto.randomBytes(16);

const password = "eFyRwJTOqvlEmTrx";

const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
let encrypted = cipher.update(password, "utf8", "hex");
encrypted += cipher.final("hex");

console.log("Encrypted password:", encrypted);
console.log("IV (store this too):", iv.toString("hex"));
