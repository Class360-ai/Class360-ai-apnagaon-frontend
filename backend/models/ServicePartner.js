const mongoose = require("mongoose");

const servicePartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true, trim: true },
    experience: { type: String, default: "" },
    area: { type: String, default: "" },
    address: { type: String, default: "" },
    availableTimings: { type: String, default: "" },
    emergencyAvailable: { type: Boolean, default: false },
    idProof: { type: String, default: "" },
    photo: { type: String, default: "" },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected", "suspended"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServicePartner", servicePartnerSchema);
