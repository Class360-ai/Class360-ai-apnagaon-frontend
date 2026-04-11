import { getDirectWhatsAppLink } from "./whatsappUtils";

const cleanPhone = (phone) => String(phone || "").replace(/\D/g, "");

export const buildCustomerOrderMessage = (order = {}, statusLabel = "") => {
  const orderId = order.orderId || order.id || order._id || "demo-order";
  const eta = order.eta || `${order.etaMinutes || 30} min`;
  const customerName = order.customerName || order.customer?.name || "Customer";
  const paymentMethod = order.paymentMethod || order.payment?.provider || "Cash on Delivery";
  const status = statusLabel || order.status || "placed";

  return `Hello ${customerName}, your ApnaGaon order is now ${status}.

Order ID: ${orderId}
ETA: ${eta}
Payment: ${paymentMethod}

Please let us know if you need any help.`;
};

export const openCustomerWhatsApp = (order = {}, statusLabel = "") => {
  const phone = cleanPhone(order.phone || order.customer?.phone || order.address?.phone);
  if (!phone) return false;
  const message = buildCustomerOrderMessage(order, statusLabel);
  const link = getDirectWhatsAppLink(phone, message);
  if (!link) return false;
  window.open(link, "_blank", "noopener,noreferrer");
  return true;
};

export const callCustomer = (order = {}) => {
  const phone = cleanPhone(order.phone || order.customer?.phone || order.address?.phone);
  if (!phone) return false;
  window.location.href = `tel:${phone}`;
  return true;
};

export const getOrderCustomerName = (order = {}) => order.customerName || order.customer?.name || "ApnaGaon Customer";

export const getOrderPhone = (order = {}) => order.phone || order.customer?.phone || order.address?.phone || "";
