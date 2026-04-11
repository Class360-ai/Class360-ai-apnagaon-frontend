const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");
const { notifyRoleUsers, notifyUsers } = require("../utils/notificationHelpers");

const STATUS_NOTES = {
  placed: "Your order has been placed successfully",
  confirmed: "Your order has been confirmed",
  preparing: "Your order is being prepared",
  assigned: "A delivery partner has been assigned",
  picked_up: "Your order has been picked up",
  on_the_way: "Your order is on the way",
  out_for_delivery: "Your order is out for delivery",
  delivered: "Your order has been delivered",
  failed_delivery: "Delivery attempt failed",
  cancelled: "Your order has been cancelled",
};

const createOrderNotification = async (order, status = "placed", note = "") => {
  if (!order?.userId) return;
  const title = order.orderId ? `Order #${order.orderId}` : "Order update";
  const message = note || STATUS_NOTES[status] || "Order update";
  await notifyUsers([order.userId], {
    role: "customer",
    orderId: order.orderId || order.id || "",
    title,
    message,
    type: "order_update",
    read: false,
    link: `/track-order/${order.orderId || order.id || ""}`,
  });
};

const createOrder = async (req, res) => {
  const totals = req.body.totals || {};
  const createdAt = new Date();
  const payload = {
    ...req.body,
    orderId: req.body.orderId || req.body.id || `AG${Date.now().toString().slice(-8)}`,
    userId: req.user?._id || req.body.userId || null,
    subtotal: req.body.subtotal ?? totals.subtotal ?? 0,
    deliveryFee: req.body.deliveryFee ?? totals.deliveryFee ?? 0,
    serviceFee: req.body.serviceFee ?? totals.serviceFee ?? 0,
    total: req.body.total ?? totals.total ?? 0,
    commissionAmount: req.body.commissionAmount ?? Number(((req.body.total ?? totals.total ?? 0) * 0.05).toFixed(2)),
    commissionType: req.body.commissionType || "grocery_5_percent",
    status: req.body.status || "placed",
    paymentId: req.body.paymentId || null,
    paymentStatus: req.body.payment?.status || req.body.paymentStatus || (req.body.paymentMethod?.toLowerCase?.().includes("cash on delivery") ? "cod_pending" : "pending"),
    trackingSteps: req.body.trackingSteps || [{ status: "placed", time: createdAt, note: "Order placed" }],
    riderName: req.body.riderName || "",
    riderPhone: req.body.riderPhone || "",
    assignedAt: req.body.assignedAt || null,
  };
  const order = await Order.create(payload);
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { orders: order._id } });
    await createOrderNotification(order, "placed", STATUS_NOTES.placed);
  }
  await notifyRoleUsers("admin", {
    role: "admin",
    orderId: order.orderId || order.id || "",
    title: "New order received",
    message: `Order #${order.orderId || order.id || ""} has been placed.`,
    type: "system",
    read: false,
    link: "/admin/orders",
  });
  res.status(201).json(order);
};

const getOrder = async (req, res) => {
  const order = mongoose.Types.ObjectId.isValid(req.params.id)
    ? await Order.findById(req.params.id)
    : await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json(order);
};

const getOrders = async (req, res) => {
  const statusFilter = req.query.status ? { status: req.query.status } : {};
  const roleFilter = req.user?.role === "shop" && req.user.shopId ? { shopId: req.user.shopId } : {};
  const riderFilter = ["rider", "delivery"].includes(req.user?.role) ? { $or: [{ riderId: req.user._id }, { deliveryPartnerId: req.user._id }] } : {};
  const orders = await Order.find({ ...statusFilter, ...roleFilter, ...riderFilter }).sort({ createdAt: -1 }).limit(100);
  return res.json(orders);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { status, note = "" } = req.body;
  const order = mongoose.Types.ObjectId.isValid(req.params.id)
    ? await Order.findById(req.params.id)
    : await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;
  order.trackingSteps.push({ status, note: note || `Order status updated to ${status}` });
  if (status === "assigned" && req.body.deliveryPartnerId) {
    order.deliveryPartnerId = req.body.deliveryPartnerId;
    order.riderId = req.body.deliveryPartnerId;
    order.riderName = req.body.riderName || order.riderName || "";
    order.riderPhone = req.body.riderPhone || order.riderPhone || "";
    order.assignedAt = req.body.assignedAt || new Date();
  }
  if (status === "picked_up" || status === "on_the_way") {
    order.riderId = order.riderId || req.body.deliveryPartnerId || null;
    order.deliveryPartnerId = order.deliveryPartnerId || req.body.deliveryPartnerId || null;
  }
  await order.save();
  await createOrderNotification(order, status, note || STATUS_NOTES[status] || `Order status updated to ${status}`);
  return res.json(order);
};

const assignDeliveryPartner = async (req, res) => {
  const { deliveryPartnerId, riderName = "", riderPhone = "" } = req.body;
  if (!deliveryPartnerId) return res.status(400).json({ message: "deliveryPartnerId is required" });
  const order = mongoose.Types.ObjectId.isValid(req.params.id)
    ? await Order.findById(req.params.id)
    : await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const partner = await User.findById(deliveryPartnerId).select("name phone role");
  if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
  if (!["rider", "delivery"].includes(String(partner.role || "").toLowerCase())) {
    return res.status(400).json({ message: "Selected user is not a delivery partner" });
  }

  order.deliveryPartnerId = partner._id;
  order.riderId = partner._id;
  order.riderName = riderName || partner.name || "";
  order.riderPhone = riderPhone || partner.phone || "";
  order.assignedAt = new Date();
  order.status = "assigned";
  order.trackingSteps.push({ status: "assigned", time: order.assignedAt, note: `Assigned to ${order.riderName || "delivery partner"}` });
  await order.save();
  await createOrderNotification(order, "assigned", `Assigned to ${order.riderName || "delivery partner"}`);
  await notifyUsers([partner._id], {
    role: "delivery",
    orderId: order.orderId || order.id || "",
    title: `Delivery assigned #${order.orderId || order.id || ""}`,
    message: `New delivery assigned for ${order.riderName || "you"}`,
    type: "order_update",
    read: false,
    link: "/delivery/orders",
  });
  return res.json(order);
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  assignDeliveryPartner,
};
