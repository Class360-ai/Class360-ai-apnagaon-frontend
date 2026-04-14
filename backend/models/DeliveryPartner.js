const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    vehicle: { type: String, default: "Bike", trim: true },
    vehicleType: { type: String, default: "Bike", trim: true },
    status: { type: String, enum: ["available", "busy"], default: "available" },
    currentStatus: { type: String, enum: ["offline", "available", "busy"], default: "available" },
    available: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    currentOrderId: { type: String, default: null },
    area: { type: String, default: "", trim: true },
    activeOrdersCount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
