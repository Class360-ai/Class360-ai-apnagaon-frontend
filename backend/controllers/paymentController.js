const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { notifyUsers } = require("../utils/notificationHelpers");

const PAYMENT_STATUS_NOTE = {
  pending: "Payment is pending",
  paid: "Payment completed successfully",
  failed: "Payment failed",
  cod_pending: "Cash on delivery selected",
  refunded: "Payment was refunded",
};

const syncOrderPayment = async (payment) => {
  if (!payment?.orderId) return null;
  const order = await Order.findOne({ $or: [{ orderId: payment.orderId }, { _id: payment.orderId }] });
  if (!order) return null;
  order.paymentId = payment._id;
  order.paymentStatus = payment.status;
  order.payment = {
    ...(order.payment || {}),
    id: payment._id,
    orderId: payment.orderId,
    method: payment.method,
    provider: payment.provider,
    amount: payment.amount,
    status: payment.status,
    transactionId: payment.transactionId || "",
    createdAt: payment.createdAt,
  };
  await order.save();
  return order;
};

const createPayment = async (req, res) => {
  const payload = {
    orderId: String(req.body.orderId || "").trim(),
    userId: req.user?._id || req.body.userId || null,
    method: req.body.method === "cod" ? "cod" : "upi",
    provider: String(req.body.provider || (req.body.method === "cod" ? "cod" : "gpay")).trim().toLowerCase() || "gpay",
    amount: Number(req.body.amount) || 0,
    status: req.body.method === "cod" ? "cod_pending" : String(req.body.status || "pending"),
    transactionId: String(req.body.transactionId || "").trim(),
    meta: req.body.meta || {},
  };

  if (!payload.orderId) return res.status(400).json({ message: "orderId is required" });

  const payment = await Payment.create(payload);
  const order = await syncOrderPayment(payment);

  if (order?.userId) {
    await notifyUsers([order.userId], {
      role: "customer",
      orderId: order.orderId || order.id || payment.orderId,
      title: `Payment ${PAYMENT_STATUS_NOTE[payment.status] ? "update" : "received"}`,
      message: PAYMENT_STATUS_NOTE[payment.status] || "Payment update",
      type: "order_update",
      read: false,
      link: `/order-confirmed/${order.orderId || order.id || payment.orderId}`,
    });
  }

  return res.status(201).json({ payment, order });
};

const getPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  return res.json(payment);
};

const getPaymentByOrderId = async (req, res) => {
  const payment = await Payment.findOne({ orderId: req.params.orderId }).sort({ createdAt: -1 });
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  return res.json(payment);
};

const verifyPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  const success = req.body.success !== false;
  payment.status = success ? "paid" : "failed";
  payment.transactionId = String(req.body.transactionId || payment.transactionId || "").trim() || `txn_${Date.now()}`;
  payment.meta = { ...(payment.meta || {}), verifiedAt: new Date().toISOString(), gateway: req.body.gateway || "simulated" };
  await payment.save();

  const order = await syncOrderPayment(payment);
  if (order?.userId) {
    await notifyUsers([order.userId], {
      role: "customer",
      orderId: order.orderId || order.id || payment.orderId,
      title: `Payment ${payment.status === "paid" ? "successful" : "failed"}`,
      message: PAYMENT_STATUS_NOTE[payment.status] || "Payment update",
      type: "order_update",
      read: false,
      link: `/order-confirmed/${order.orderId || order.id || payment.orderId}`,
    });
  }

  return res.json({ payment, order });
};

const updatePaymentStatus = async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  if (!["pending", "paid", "failed", "cod_pending", "refunded"].includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid payment status" });
  }

  payment.status = req.body.status;
  payment.transactionId = String(req.body.transactionId || payment.transactionId || "").trim();
  await payment.save();
  const order = await syncOrderPayment(payment);
  return res.json({ payment, order });
};

module.exports = {
  createPayment,
  getPayment,
  getPaymentByOrderId,
  verifyPayment,
  updatePaymentStatus,
};
