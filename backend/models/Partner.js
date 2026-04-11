const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, default: "" },
    category: { type: String, default: "grocery" },
    address: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    description: { type: String, default: "" },
    deliveryAvailable: { type: Boolean, default: true },
    openingTime: { type: String, default: "" },
    closingTime: { type: String, default: "" },
    image: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    upiId: { type: String, default: "" },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
    reviewNote: { type: String, default: "" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);
