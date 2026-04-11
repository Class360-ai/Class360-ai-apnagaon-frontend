import { getWhatsAppLink } from "./whatsappUtils";

const buildItemLines = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const qty = Number(item?.quantity || item?.qty || 1);
      const name = item?.name || "Item";
      return `- ${name} x${qty}`;
    })
    .join("\n");

const buildRewardLines = (reward) => {
  if (!reward) return "";
  const lines = [`Applied Reward: ${reward.name || "Reward"}`];
  if (reward.code) lines.push(`Reward Code: ${reward.code}`);
  if (reward.rewardType === "discount") lines.push("Please apply this discount reward in my order.");
  if (reward.rewardType === "delivery") lines.push("Please apply free delivery reward.");
  if (reward.rewardType === "item") lines.push("Please add the free item reward with this order.");
  return lines.join("\n");
};

export const openWhatsAppWithReward = (orderPayload = {}, reward = null) => {
  const itemsText = buildItemLines(orderPayload.items || []);
  const village = orderPayload?.village || "Azamgarh";
  const address = orderPayload?.address || "";
  const phone = orderPayload?.phone || "";
  const paymentMethod = orderPayload?.paymentMethod || "Cash on Delivery";
  const total = Number.isFinite(orderPayload?.total) ? orderPayload.total : null;
  const rewardLines = buildRewardLines(reward);

  const message = [
    "Hello, I want to place an order from ApnaGaon.",
    "",
    "Items:",
    itemsText || "- Please check cart items",
    total !== null ? `Total: \u20B9${total}` : "",
    `Payment: ${paymentMethod}`,
    `Village: ${village}`,
    address ? `Address: ${address}` : "",
    phone ? `Phone: ${phone}` : "",
    rewardLines,
  ]
    .filter(Boolean)
    .join("\n");

  const link = getWhatsAppLink(message);
  if (!link || link === "javascript:void(0)") return false;
  try {
    window.open(link, "_blank", "noopener,noreferrer");
    return true;
  } catch (error) {
    return false;
  }
};
