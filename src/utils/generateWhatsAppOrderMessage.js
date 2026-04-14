import { getLaunchBrandName } from "./runtimeConfig";

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const buildItemLines = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const quantity = Math.max(1, Number(item?.quantity || item?.qty || 1) || 1);
      const price = Number(item?.price || 0) || 0;
      return `- ${item?.name || "Item"} x${quantity} = ${formatMoney(price * quantity)}`;
    })
    .join("\n");

export const generateWhatsAppOrderMessage = ({
  orderId = "",
  customerName = "ApnaGaon Customer",
  phone = "",
  address = "",
  landmark = "",
  notes = "",
  paymentMethod = "Cash on Delivery",
  items = [],
  totals = {},
  source = "app",
} = {}) => {
  const brandName = getLaunchBrandName();
  const itemLines = buildItemLines(items);
  const deliveryFee = Number(totals.deliveryFee || 0) || 0;
  const packagingFee = Number(totals.packagingFee || 0) || 0;
  const discount = Number(totals.discount || 0) || 0;
  const total = Number(totals.total || 0) || 0;

  return [
    "Namaste 🙏",
    "",
    `Mujhe ${brandName} se order place karna hai.`,
    "",
    "🛒 Items:",
    itemLines || "- Cart items not available",
    "",
    `👤 Name: ${customerName}`,
    `📞 Phone: ${phone || "NA"}`,
    `📍 Address: ${address || "NA"}`,
    `🧭 Landmark: ${landmark || "NA"}`,
    `📝 Notes: ${notes || "NA"}`,
    `💰 Payment: ${paymentMethod}`,
    "",
    `Order ID: ${orderId || "Pending"}`,
    `Source: ${source}`,
    `Subtotal: ${formatMoney(totals.subtotal || 0)}`,
    `Delivery Fee: ${deliveryFee > 0 ? formatMoney(deliveryFee) : "FREE"}`,
    `Packaging: ${packagingFee > 0 ? formatMoney(packagingFee) : "FREE"}`,
    `Discount: ${discount > 0 ? `- ${formatMoney(discount)}` : "FREE"}`,
    `Total: ${formatMoney(total)}`,
    "",
    "Kripya order confirm kar dein. Dhanyawaad 🙏",
  ]
    .filter(Boolean)
    .join("\n");
};

export default generateWhatsAppOrderMessage;
