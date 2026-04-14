import { getLocalOrderById, getLocalOrders, saveLocalOrder, updateLocalOrderStatus, createOrderId, ORDER_STATUS_META } from "./orderStorage";

const TRACKING_SEQUENCE = ["placed", "confirmed", "preparing", "out_for_delivery", "delivered"];

const buildInitialTrackingSteps = (status = "placed", createdAt = new Date().toISOString()) => [
  {
    status,
    time: createdAt,
    note: ORDER_STATUS_META[status]?.note || "Order placed",
  },
];

export const createOrder = (payload = {}) => {
  const createdAt = payload.createdAt || new Date().toISOString();
  const orderId = payload.orderId || payload.id || createOrderId();
  return saveLocalOrder({
    ...payload,
    id: orderId,
    orderId,
    createdAt,
    updatedAt: payload.updatedAt || createdAt,
    status: payload.status || "placed",
    trackingSteps: Array.isArray(payload.trackingSteps) && payload.trackingSteps.length
      ? payload.trackingSteps
      : buildInitialTrackingSteps(payload.status || "placed", createdAt),
  });
};

export const getOrders = () => getLocalOrders();

export const getOrderById = (id) => getLocalOrderById(id);

export const updateOrderStatus = (id, status, note = "") => updateLocalOrderStatus(id, status, note);

export const advanceDemoOrderStatus = (id) => {
  const order = getOrderById(id);
  if (!order) return null;

  const currentIndex = Math.max(0, TRACKING_SEQUENCE.indexOf(String(order.status || "placed")));
  const nextStatus = TRACKING_SEQUENCE[Math.min(currentIndex + 1, TRACKING_SEQUENCE.length - 1)];
  if (!nextStatus || nextStatus === order.status) return order;
  return updateOrderStatus(id, nextStatus, ORDER_STATUS_META[nextStatus]?.note || `Order updated to ${nextStatus}`);
};

export const resolveOrderTrackingStatus = (order = {}) => {
  const status = String(order.status || "placed");
  if (TRACKING_SEQUENCE.includes(status)) return status;
  if (status === "whatsapp_pending") return "placed";
  return "placed";
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  advanceDemoOrderStatus,
  resolveOrderTrackingStatus,
};
