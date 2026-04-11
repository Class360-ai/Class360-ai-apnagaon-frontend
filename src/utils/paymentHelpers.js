import { UPI_METHODS } from "./upiPayments";

export const PAYMENT_METHODS = {
  UPI: "upi",
  COD: "cod",
  CARD: "card",
};

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  COD_PENDING: "cod_pending",
  REFUNDED: "refunded",
};

export const UPI_PROVIDER_MAP = {
  "Google Pay": "gpay",
  PhonePe: "phonepe",
  Paytm: "paytm",
  BHIM: "bhim",
};

export const getPaymentProviderKey = (provider = "") => UPI_PROVIDER_MAP[provider] || String(provider || "").toLowerCase() || "cod";

export const getPaymentMethodLabel = (method = "", provider = "") => {
  if (method === PAYMENT_METHODS.UPI) return `UPI - ${provider || "Google Pay"}`;
  if (method === PAYMENT_METHODS.COD) return "Cash on Delivery";
  if (method === PAYMENT_METHODS.CARD) return "Card Payment";
  return "Payment Pending";
};

export const getPaymentStatusLabel = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === PAYMENT_STATUSES.PAID) return "Paid";
  if (normalized === PAYMENT_STATUSES.FAILED) return "Failed";
  if (normalized === PAYMENT_STATUSES.COD_PENDING) return "COD Pending";
  if (normalized === PAYMENT_STATUSES.REFUNDED) return "Refunded";
  return "Pending";
};

export const getPaymentStatusTone = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === PAYMENT_STATUSES.PAID) return "emerald";
  if (normalized === PAYMENT_STATUSES.FAILED) return "red";
  if (normalized === PAYMENT_STATUSES.COD_PENDING) return "orange";
  if (normalized === PAYMENT_STATUSES.REFUNDED) return "violet";
  return "slate";
};

export const isPaymentRetryable = (status = "") => [PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.PENDING].includes(String(status || "").toLowerCase());

export const createPaymentPayload = ({
  orderId = "",
  userId = "",
  method = PAYMENT_METHODS.UPI,
  provider = "gpay",
  amount = 0,
  status = PAYMENT_STATUSES.PENDING,
  transactionId = "",
  meta = {},
} = {}) => ({
  orderId,
  userId,
  method,
  provider,
  amount: Number(amount) || 0,
  status,
  transactionId,
  meta,
});

export const buildSimulatedTransactionId = (orderId = "", provider = "") =>
  `txn_${String(orderId || Date.now()).replace(/\s+/g, "")}_${String(provider || "upi").toLowerCase()}`;

export const getDefaultUpiProvider = () => UPI_METHODS[0] || "Google Pay";

export const resolveUpiProviderKey = (provider = "") => getPaymentProviderKey(provider);
