const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "grocery", trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true },
    minStockAlert: { type: Number, default: 5, min: 0 },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
    unit: { type: String, default: "piece" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
