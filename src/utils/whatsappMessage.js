import { getWhatsAppLink } from "./whatsappUtils";
import generateWhatsAppOrderMessage from "./generateWhatsAppOrderMessage";

export const buildCheckoutWhatsAppMessage = (data = {}) =>
  generateWhatsAppOrderMessage({
    orderId: data.orderId,
    customerName: data.customer?.name || data.customerName || "ApnaGaon Customer",
    phone: data.customer?.phone || data.phone || "",
    address: data.customer?.address || data.address || "",
    landmark: data.customer?.landmark || data.landmark || "",
    notes: data.customer?.notes || data.notes || "",
    paymentMethod: data.paymentMethod || "Cash on Delivery",
    items: data.items || [],
    totals: data.totals || {},
    source: data.source || "app",
  });

export const buildWhatsAppCheckoutLink = (message) => {
  if (!message) return "javascript:void(0)";
  return getWhatsAppLink(message);
};

export default {
  buildCheckoutWhatsAppMessage,
  buildWhatsAppCheckoutLink,
};
