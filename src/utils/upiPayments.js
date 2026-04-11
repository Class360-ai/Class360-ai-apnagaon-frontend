export const UPI_METHODS = ["Google Pay", "PhonePe", "Paytm", "BHIM"];

const gatewayNotes = {
  razorpay: "Create an order on your backend, open Razorpay Checkout, then verify payment signature before marking paid.",
  phonepe: "Create a PhonePe payment request on your backend, redirect to the returned URL, then handle webhook/status check.",
  cashfree: "Create a Cashfree payment session on your backend, open checkout, then verify payment status server-side.",
};

export const createUpiPaymentIntent = ({ amount = 0, orderId = "", method = "Google Pay", payeeVpa = "" } = {}) => ({
  mode: "simulated",
  provider: method,
  amount: Number(amount) || 0,
  orderId,
  upiLink: payeeVpa
    ? `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent("ApnaGaon")}&am=${encodeURIComponent(Number(amount) || 0)}&cu=INR&tn=${encodeURIComponent(`ApnaGaon order ${orderId}`)}`
    : "",
  gatewayReady: false,
  gatewayNotes,
});

export const getPaymentDisplayName = (paymentMethod, upiMethod) => {
  if (paymentMethod === "upi") return `UPI - ${upiMethod || "Google Pay"}`;
  if (paymentMethod === "cod") return "Cash on Delivery";
  if (paymentMethod === "gift") return "Gift Card / Coupon";
  if (paymentMethod === "card") return "Card Payment";
  return "Payment Pending";
};
