const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    phone: { type: String, default: "" },
    available: { type: Boolean, default: true },
    etaBaseMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
