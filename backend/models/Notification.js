const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, default: "" },
    orderId: { type: String, default: "" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["order_update", "offer", "reward", "system"], default: "system" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
