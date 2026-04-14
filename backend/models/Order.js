const mongoose = require("mongoose");

const trackingStepSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    time: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, default: "" },
    phone: { type: String, default: "" },
    customer: { type: Object, default: {} },
    address: { type: Object, default: {} },
    items: { type: Array, default: [] },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner", default: null },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryPartner", default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    orderId: { type: String, index: true },
    totals: { type: Object, default: {} },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "" },
    payment: { type: Object, default: {} },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cod_pending", "refunded"],
      default: "pending",
    },
    couponCode: { type: String, default: "" },
    couponUsed: { type: String, default: "" },
    rewardUsed: { type: String, default: "" },
    commissionAmount: { type: Number, default: 0 },
    commissionType: { type: String, default: "grocery_5_percent" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled", "assigned", "picked_up", "on_the_way", "failed_delivery"],
      default: "placed",
    },
    trackingSteps: { type: [trackingStepSchema], default: [{ status: "placed", note: "Order placed" }] },
    riderName: { type: String, default: "" },
    riderPhone: { type: String, default: "" },
    assignedAt: { type: Date, default: null },
    eta: { type: String, default: "" },
    etaMinutes: { type: Number, default: 20 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
