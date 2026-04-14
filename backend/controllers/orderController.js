const Order = require("../models/Order");
const User = require("../models/User");
const DeliveryPartner = require("../models/DeliveryPartner");
const mongoose = require("mongoose");
const { notifyRoleUsers, notifyUsers } = require("../utils/notificationHelpers");
const { normalizeRole } = require("../utils/roleUtils");

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

const ALLOWED_ORDER_STATUSES = new Set([
  "placed",
  "confirmed",
  "preparing",
  "assigned",
  "picked_up",
  "on_the_way",
  "out_for_delivery",
  "delivered",
  "failed_delivery",
  "cancelled",
]);

const normalizeOrderStatus = (status) => String(status || "").trim().toLowerCase();

const toObject = (doc) => {
  if (!doc) return null;
  return typeof doc.toObject === "function" ? doc.toObject() : doc;
};

const applyOrderPopulation = (query) =>
  query
    .populate("riderId", "name phone vehicleType")
    .populate("deliveryPartnerId", "name phone vehicleType");

const enrichOrderWithRider = async (orderDoc) => {
  const order = toObject(orderDoc);
  if (!order) return null;

  const riderId = order.riderId || order.deliveryPartnerId || null;
  if (!riderId) return order;

  let rider = null;
  if (mongoose.Types.ObjectId.isValid(riderId)) {
    rider = await DeliveryPartner.findById(riderId).lean();
  }
  if (rider) {
    order.riderId = rider;
    order.deliveryPartnerId = rider._id;
    order.riderName = order.riderName || rider.name || "";
    order.riderPhone = order.riderPhone || rider.phone || "";
    order.riderVehicleType = rider.vehicleType || rider.vehicle || "";
    order.riderStatus = rider.currentStatus || rider.status || "";
    order.riderAvailable = rider.isAvailable ?? rider.available ?? false;
  }
  return order;
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

const loadDeliveryPartner = async (deliveryPartnerId) => {
  if (!deliveryPartnerId) return null;
  const partner =
    (mongoose.Types.ObjectId.isValid(deliveryPartnerId) ? await DeliveryPartner.findById(deliveryPartnerId) : null) ||
    (mongoose.Types.ObjectId.isValid(deliveryPartnerId) ? await User.findById(deliveryPartnerId).select("name phone role") : null);
  return partner;
};

const setDeliveryPartnerAvailability = async (deliveryPartnerId, status) => {
  if (!deliveryPartnerId) return;
  const nextStatus = ["delivered", "cancelled", "failed_delivery"].includes(status) ? "available" : "busy";
  const partner = mongoose.Types.ObjectId.isValid(deliveryPartnerId) ? await DeliveryPartner.findById(deliveryPartnerId) : null;
  if (partner) {
    partner.status = nextStatus;
    partner.currentStatus = nextStatus === "available" ? "available" : "busy";
    partner.available = nextStatus === "available";
    partner.isAvailable = nextStatus === "available";
    await partner.save();
    return;
  }
  if (mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
    await User.findByIdAndUpdate(deliveryPartnerId, {
      available: nextStatus === "available",
    });
  }
};

const createOrder = async (req, res) => {
  const totals = req.body.totals || {};
  const createdAt = new Date();
  const paymentMethod = String(req.body.paymentMethod || "").trim();
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
    status: normalizeOrderStatus(req.body.status) || "placed",
    paymentId: req.body.paymentId || null,
    paymentStatus: req.body.payment?.status || req.body.paymentStatus || (paymentMethod.toLowerCase().includes("cash on delivery") ? "cod_pending" : "pending"),
    trackingSteps: req.body.trackingSteps || [{ status: "placed", time: createdAt, note: "Order placed" }],
    riderName: req.body.riderName || "",
    riderPhone: req.body.riderPhone || "",
    assignedAt: req.body.assignedAt || null,
  };
  console.log("[ApnaGaon] Creating order payload:", {
    orderId: payload.orderId,
    status: payload.status,
    paymentStatus: payload.paymentStatus,
    db: mongoose.connection.name,
    collection: Order.collection.name,
  });
  const order = await Order.create(payload);
  console.log("[ApnaGaon] Order saved successfully:", {
    id: order._id,
    orderId: order.orderId,
    status: order.status,
    db: mongoose.connection.name,
    collection: Order.collection.name,
  });
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { orders: order._id } });
    await createOrderNotification(order, "placed", STATUS_NOTES.placed);
  }
  await notifyRoleUsers("owner", {
    role: "owner",
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
  const order = await applyOrderPopulation(
    mongoose.Types.ObjectId.isValid(req.params.id)
      ? Order.findById(req.params.id)
      : Order.findOne({ orderId: req.params.id })
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json(await enrichOrderWithRider(order));
};

const getOrders = async (req, res) => {
  const statusFilter = req.query.status ? { status: req.query.status } : {};
  const normalizedRole = normalizeRole(req.user?.role);
  const roleFilter = normalizedRole === "shop_admin" && req.user?.shopId ? { shopId: req.user.shopId } : {};
  const riderFilter = normalizedRole === "delivery" ? { $or: [{ riderId: req.user._id }, { deliveryPartnerId: req.user._id }] } : {};
  const orders = await applyOrderPopulation(Order.find({ ...statusFilter, ...roleFilter, ...riderFilter }).sort({ createdAt: -1 }).limit(100));
  return res.json(await Promise.all(orders.map(enrichOrderWithRider)));
};

const getMyOrders = async (req, res) => {
  const orders = await applyOrderPopulation(Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100));
  return res.json(await Promise.all(orders.map(enrichOrderWithRider)));
};

const updateOrderStatus = async (req, res) => {
  const { status, note = "" } = req.body;
  const normalizedStatus = normalizeOrderStatus(status);
  const normalizedRole = normalizeRole(req.user?.role);
  if (!ALLOWED_ORDER_STATUSES.has(normalizedStatus)) {
    return res.status(400).json({
      message: "Invalid order status",
      allowedStatuses: Array.from(ALLOWED_ORDER_STATUSES),
    });
  }
  const order = mongoose.Types.ObjectId.isValid(req.params.id)
    ? await Order.findById(req.params.id)
    : await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (normalizedRole === "shop_admin" && String(order.shopId || "") !== String(req.user.shopId || "")) {
    return res.status(403).json({ message: "Not allowed to update orders outside your shop" });
  }
  if (normalizedRole === "delivery") {
    const allowedDeliveryStatuses = new Set(["assigned", "picked_up", "on_the_way", "out_for_delivery", "delivered", "failed_delivery"]);
    if (!allowedDeliveryStatuses.has(normalizedStatus)) {
      return res.status(403).json({ message: "Delivery partner can only update delivery progress statuses" });
    }
  }

  order.status = normalizedStatus;
  order.trackingSteps.push({ status: normalizedStatus, note: note || `Order status updated to ${normalizedStatus}` });
  if (normalizedStatus === "assigned" && req.body.deliveryPartnerId) {
    order.deliveryPartnerId = req.body.deliveryPartnerId;
    order.riderId = req.body.deliveryPartnerId;
    order.riderName = req.body.riderName || order.riderName || "";
    order.riderPhone = req.body.riderPhone || order.riderPhone || "";
    order.assignedAt = req.body.assignedAt || new Date();
  }
  if (normalizedStatus === "picked_up" || normalizedStatus === "on_the_way") {
    order.riderId = order.riderId || req.body.deliveryPartnerId || null;
    order.deliveryPartnerId = order.deliveryPartnerId || req.body.deliveryPartnerId || null;
  }
  await order.save();
  await setDeliveryPartnerAvailability(order.deliveryPartnerId || order.riderId, normalizedStatus);
  console.log("[ApnaGaon] Order status updated:", {
    id: order._id,
    orderId: order.orderId,
    status: order.status,
    db: mongoose.connection.name,
    collection: Order.collection.name,
  });
  await createOrderNotification(order, normalizedStatus, note || STATUS_NOTES[normalizedStatus] || `Order status updated to ${normalizedStatus}`);
  const populated = await applyOrderPopulation(Order.findById(order._id));
  return res.json(await enrichOrderWithRider(populated));
};

const assignDeliveryPartner = async (req, res) => {
  const deliveryPartnerId = req.body.deliveryPartnerId || req.body.riderId;
  const { riderName = "", riderPhone = "" } = req.body;
  if (!deliveryPartnerId) return res.status(400).json({ message: "deliveryPartnerId is required" });

  const orderIdParam = req.params.id;
  const orderIdValid = mongoose.Types.ObjectId.isValid(orderIdParam);
  const riderIdValid = mongoose.Types.ObjectId.isValid(deliveryPartnerId);
  console.log("[ApnaGaon] assign-rider request:", {
    orderId: orderIdParam,
    orderIdValid,
    riderId: deliveryPartnerId,
    riderIdValid,
  });
  if (!orderIdValid && !String(orderIdParam || "").trim()) {
    return res.status(400).json({ message: "Invalid order id" });
  }
  if (!riderIdValid && !String(deliveryPartnerId || "").trim()) {
    return res.status(400).json({ message: "Invalid rider id" });
  }

  const order = mongoose.Types.ObjectId.isValid(req.params.id)
    ? await Order.findById(req.params.id)
    : await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const partner = await loadDeliveryPartner(deliveryPartnerId);
  if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
  if (partner.role && normalizeRole(partner.role) !== "delivery") {
    return res.status(400).json({ message: "Selected user is not a delivery partner" });
  }

  console.log("[ApnaGaon] assign-rider resolved partner:", {
    partnerId: partner._id,
    partnerName: partner.name,
    partnerPhone: partner.phone,
    model: partner.constructor?.modelName || "unknown",
  });

  order.deliveryPartnerId = partner._id;
  order.riderId = partner._id;
  order.riderName = riderName || partner.name || "";
  order.riderPhone = riderPhone || partner.phone || "";
  order.assignedAt = new Date();
  order.status = "out_for_delivery";
  order.trackingSteps.push({
    status: "out_for_delivery",
    time: order.assignedAt,
    note: `Assigned to ${order.riderName || "delivery partner"} and out for delivery`,
  });
  await order.save();
  await setDeliveryPartnerAvailability(partner._id, "assigned");
  await createOrderNotification(order, "out_for_delivery", `Out for delivery with ${order.riderName || "delivery partner"}`);
  if (partner.role) {
    await notifyUsers([partner._id], {
      role: "delivery",
      orderId: order.orderId || order.id || "",
      title: `Delivery assigned #${order.orderId || order.id || ""}`,
      message: `New delivery assigned for ${order.riderName || "you"}`,
      type: "order_update",
      read: false,
      link: "/delivery/orders",
    });
  }
  const populated = await applyOrderPopulation(Order.findById(order._id));
  const responseOrder = await enrichOrderWithRider(populated);
  console.log("[ApnaGaon] assign-rider success:", {
    orderId: responseOrder?.orderId,
    status: responseOrder?.status,
    riderId: responseOrder?.riderId?._id || responseOrder?.riderId || responseOrder?.deliveryPartnerId || null,
  });
  return res.json({ ok: true, order: responseOrder });
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  assignDeliveryPartner,
  enrichOrderWithRider,
};
