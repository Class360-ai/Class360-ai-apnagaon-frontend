const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    openingTime: { type: String, default: "" },
    closingTime: { type: String, default: "" },
    deliveryAvailable: { type: Boolean, default: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner", default: null },
    available: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    etaBaseMinutes: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);
