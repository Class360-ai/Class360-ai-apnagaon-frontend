const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "Home" },
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    house: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    note: { type: String, default: "" },
    lat: { type: Number, default: null },
    lon: { type: Number, default: null },
    source: { type: String, enum: ["current", "map", "manual"], default: "manual" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
