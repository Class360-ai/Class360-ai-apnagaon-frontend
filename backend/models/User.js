const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin", "owner", "shop", "shop_admin", "rider", "delivery"], default: "customer" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
    available: { type: Boolean, default: true },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    preferences: { type: Object, default: {} },
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password || "")).digest("hex");
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return this.passwordHash === this.constructor.hashPassword(password);
};

module.exports = mongoose.model("User", userSchema);
