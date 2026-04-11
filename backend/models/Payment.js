const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    method: { type: String, enum: ["upi", "cod"], required: true },
    provider: { type: String, default: "cod" },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cod_pending", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
