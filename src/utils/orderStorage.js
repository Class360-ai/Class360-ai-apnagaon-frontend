import { addLocalNotification } from "./notificationStorage";

export const LOCAL_ORDERS_KEY = "apnagaon_local_orders_v1";
export const ORDER_UPDATED_EVENT = "apnagaon:order-updated";

export const ORDER_STATUSES = ["placed", "confirmed", "preparing", "assigned", "picked_up", "on_the_way", "out_for_delivery", "delivered", "failed_delivery", "cancelled"];

export const ORDER_STATUS_META = {
  placed: { label: "Placed", note: "Order placed", tone: "emerald" },
  confirmed: { label: "Confirmed", note: "Shop confirmed your order", tone: "blue" },
  preparing: { label: "Preparing", note: "Items are being packed", tone: "orange" },
  assigned: { label: "Assigned", note: "Delivery partner assigned", tone: "blue" },
  picked_up: { label: "Picked Up", note: "Order picked up by rider", tone: "orange" },
  on_the_way: { label: "On the Way", note: "Rider is on the way", tone: "purple" },
  out_for_delivery: { label: "Out for Delivery", note: "Rider is on the way", tone: "purple" },
  delivered: { label: "Delivered", note: "Order delivered", tone: "emerald" },
  failed_delivery: { label: "Failed", note: "Delivery attempt failed", tone: "red" },
  cancelled: { label: "Cancelled", note: "Order cancelled", tone: "red" },
};

const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const dispatchOrderUpdate = (order) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(ORDER_UPDATED_EVENT, { detail: order }));
};

export const createOrderId = () => `AG${Date.now().toString().slice(-8)}`;

export const normalizeOrder = (orderPayload = {}) => {
  const createdAt = orderPayload.createdAt || new Date().toISOString();
  const id = orderPayload.orderId || orderPayload.id || orderPayload._id || createOrderId();
  const status = ORDER_STATUSES.includes(orderPayload.status) ? orderPayload.status : "placed";
  const paymentStatus = String(
    orderPayload.paymentStatus ||
      orderPayload.payment?.status ||
      (String(orderPayload.paymentMethod || "").toLowerCase().includes("cash on delivery") ? "cod_pending" : "")
  ).trim() || (String(orderPayload.paymentMethod || "").toLowerCase().includes("cash on delivery") ? "cod_pending" : "pending");
  const trackingSteps = Array.isArray(orderPayload.trackingSteps) && orderPayload.trackingSteps.length
    ? orderPayload.trackingSteps
    : [{ status, time: createdAt, note: ORDER_STATUS_META[status]?.note || "Order placed" }];

  return {
    ...orderPayload,
    id,
    orderId: id,
    createdAt,
    updatedAt: orderPayload.updatedAt || createdAt,
    status,
    paymentStatus,
    trackingSteps,
  };
};

export const getLocalOrders = () => {
  if (!hasStorage()) return [];
  try {
    const saved = window.localStorage.getItem(LOCAL_ORDERS_KEY);
    const orders = saved ? JSON.parse(saved) : [];
    return Array.isArray(orders) ? orders.map(normalizeOrder) : [];
  } catch {
    return [];
  }
};

const writeLocalOrders = (orders = []) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders.map(normalizeOrder).slice(0, 50)));
};

export const saveLocalOrder = (orderPayload = {}) => {
  const localOrder = normalizeOrder(orderPayload);

  if (!hasStorage()) return localOrder;

  try {
    const nextOrders = [localOrder, ...getLocalOrders().filter((order) => order.id !== localOrder.id && order._id !== localOrder.id && order.orderId !== localOrder.id)];
    writeLocalOrders(nextOrders);
    dispatchOrderUpdate(localOrder);
    addLocalNotification({
      orderId: localOrder.orderId,
      role: "customer",
      title: `Order #${localOrder.orderId}`,
      message: "Your order has been placed successfully",
      type: "order_update",
      link: `/track-order/${localOrder.orderId}`,
    });
  } catch {
    // The caller can still use the returned order for navigation.
  }

  return localOrder;
};

export const getLocalOrderById = (id) => {
  if (!id || !hasStorage()) return null;
  try {
    return getLocalOrders().find((order) => order.id === id || order._id === id || order.orderId === id) || null;
  } catch {
    return null;
  }
};

export const updateLocalOrderStatus = (id, status, note = "") => {
  if (!id || !ORDER_STATUSES.includes(status)) return null;
  const orders = getLocalOrders();
  const order = orders.find((item) => item.id === id || item._id === id || item.orderId === id);
  if (!order) return null;

  const updatedAt = new Date().toISOString();
  const nextOrder = normalizeOrder({
    ...order,
    status,
    updatedAt,
    trackingSteps: [
      ...(Array.isArray(order.trackingSteps) ? order.trackingSteps : []),
      { status, time: updatedAt, note: note || ORDER_STATUS_META[status]?.note || `Order updated to ${status}` },
    ],
  });

  writeLocalOrders([nextOrder, ...orders.filter((item) => item.id !== nextOrder.id && item._id !== nextOrder.id && item.orderId !== nextOrder.id)]);
  dispatchOrderUpdate(nextOrder);
  addLocalNotification({
    orderId: nextOrder.orderId,
    role: "customer",
    title: `Order #${nextOrder.orderId}`,
    message: note || ORDER_STATUS_META[status]?.note || `Order updated to ${status}`,
    type: "order_update",
    link: `/track-order/${nextOrder.orderId}`,
  });
  return nextOrder;
};
