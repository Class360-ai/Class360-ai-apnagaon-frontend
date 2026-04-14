import { ordersAPI, safeFetch } from "../utils/api";
import { createOrderId, getLocalOrderById, normalizeOrder, saveLocalOrder } from "../utils/orderStorage";
import { calculateCartTotals } from "../utils/calculateCartTotals";

const normalizeItems = (items = []) =>
  (Array.isArray(items) ? items : []).map((item, index) => ({
    id: item.id || item._id || `${item.name || "item"}-${index}`,
    name: item.name || "Item",
    price: Number(item.price || 0) || 0,
    quantity: Math.max(1, Number(item.quantity || item.qty || 1) || 1),
    image: item.image || "",
    unit: item.unit || "",
  }));

export const buildCheckoutTotals = (items = [], options = {}) => calculateCartTotals(items, options);

export const createOrder = async (orderPayload = {}) => {
  const orderId = orderPayload.orderId || orderPayload.id || createOrderId();
  const payload = {
    ...orderPayload,
    orderId,
    id: orderId,
    items: normalizeItems(orderPayload.items),
    totals:
      orderPayload.totals ||
      buildCheckoutTotals(orderPayload.items, {
        deliveryFee: orderPayload.deliveryFee || 0,
        packagingFee: orderPayload.packagingFee || 0,
        appliedReward: orderPayload.appliedReward || null,
        coupon: orderPayload.coupon || null,
      }),
    createdAt: orderPayload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const backendOrder = await safeFetch(() => ordersAPI.create(payload), null);
  const orderRecord = backendOrder?.order || backendOrder || payload;
  return saveLocalOrder({
    ...payload,
    ...orderRecord,
    id: orderRecord.id || orderRecord._id || orderId,
    orderId: orderRecord.orderId || orderId,
  });
};

export const getOrderById = async (id) => {
  if (!id) return null;
  const localOrder = getLocalOrderById(id);
  if (localOrder) return localOrder;
  const backendOrder = await safeFetch(() => ordersAPI.getById(id), null);
  return backendOrder ? normalizeOrder(backendOrder) : null;
};

export const createCheckoutOrder = createOrder;

export default {
  buildCheckoutTotals,
  createOrder,
  createCheckoutOrder,
  getOrderById,
};
