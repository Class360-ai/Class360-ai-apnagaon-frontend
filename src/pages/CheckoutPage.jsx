import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EmptyState from "../components/EmptyState";
import CheckoutStepper from "../components/checkout/CheckoutStepper";
import AddressStep from "../components/checkout/AddressStep";
import OrderSummaryStep from "../components/checkout/OrderSummaryStep";
import PaymentStep from "../components/checkout/PaymentStep";
import useTranslation from "../utils/useTranslation";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { addRewardPoints } from "../utils/rewardPoints";
import { applyRewardToCart, getBestCartReward, removeAppliedReward, validateRewardUse } from "../utils/rewardHelpers";
import { getApplicableRewards, getRewardById, markUsed, removeExpiredRewards, rewardWalletEvents } from "../utils/rewardWallet";
import { ordersAPI, paymentsAPI, safeFetch } from "../utils/api";
import { useLocationIntelligence } from "../utils/locationHelpers";
import { saveLocalOrder } from "../utils/orderStorage";
import { getPaymentDisplayName } from "../utils/upiPayments";
import { buildSimulatedTransactionId, createPaymentPayload, getDefaultUpiProvider, PAYMENT_METHODS, PAYMENT_STATUSES } from "../utils/paymentHelpers";

const BASE_DELIVERY_FEE = 0;
const SERVICE_FEE = 0;

const stepFromPath = (pathname) => {
  if (pathname.includes("/checkout/payment")) return "payment";
  if (pathname.includes("/checkout/summary")) return "summary";
  return "address";
};

const couponRules = {
  APNA10: { code: "APNA10", type: "flat", value: 10, label: "Rs 10 off" },
  FREEDEL: { code: "FREEDEL", type: "delivery", value: 0, label: "Free delivery" },
  TEAGIFT: { code: "TEAGIFT", type: "flat", value: 5, label: "Tea gift discount" },
};

const resolvePaymentMethod = (method) => {
  if (method === "gift") return PAYMENT_METHODS.COD;
  if (method === "card") return PAYMENT_METHODS.UPI;
  return method === PAYMENT_METHODS.COD ? PAYMENT_METHODS.COD : PAYMENT_METHODS.UPI;
};

const CheckoutPage = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const { user } = useUser();
  const locationIntelligence = useLocationIntelligence();
  const activeStep = stepFromPath(location.pathname);

  const initialItems = location.state?.checkoutItems || cart;
  const initialRewardId = location.state?.appliedRewardId || null;
  const checkoutItems = useMemo(() => {
    if (!Array.isArray(initialItems) || initialItems.length === 0) return [];
    return initialItems.map((item) => ({ ...item, quantity: item.quantity || 1 }));
  }, [initialItems]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [checkoutItems]
  );

  const [selectedRewardId, setSelectedRewardId] = useState(initialRewardId);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
  const [upiMethod, setUpiMethod] = useState(getDefaultUpiProvider());
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUSES.PENDING);
  const [paymentError, setPaymentError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const syncRewards = () => {
      removeExpiredRewards();
      const eligible = getApplicableRewards({ area: "cart", subtotal });
      setSelectedRewardId((currentId) => {
        if (currentId && eligible.some((reward) => reward.id === currentId)) return currentId;
        const best = getBestCartReward(eligible, checkoutItems, { subtotal, deliveryFee: BASE_DELIVERY_FEE });
        return best?.id || null;
      });
    };

    syncRewards();
    window.addEventListener(rewardWalletEvents.updated, syncRewards);
    window.addEventListener("storage", syncRewards);
    return () => {
      window.removeEventListener(rewardWalletEvents.updated, syncRewards);
      window.removeEventListener("storage", syncRewards);
    };
  }, [checkoutItems, subtotal]);

  useEffect(() => {
    setPaymentStatus(paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUSES.COD_PENDING : PAYMENT_STATUSES.PENDING);
    setPaymentError("");
  }, [paymentMethod]);

  const selectedReward = useMemo(() => (selectedRewardId ? getRewardById(selectedRewardId) : null), [selectedRewardId]);

  const rewardPricing = useMemo(() => {
    if (!selectedReward) return removeAppliedReward(checkoutItems, { subtotal, deliveryFee: BASE_DELIVERY_FEE });
    return applyRewardToCart(checkoutItems, selectedReward, { subtotal, deliveryFee: BASE_DELIVERY_FEE });
  }, [checkoutItems, selectedReward, subtotal]);

  const pricing = useMemo(() => {
    let deliveryFee = rewardPricing.deliveryFee || 0;
    let couponDiscount = 0;
    if (appliedCoupon?.type === "flat") couponDiscount = Math.min(appliedCoupon.value, Math.max(0, rewardPricing.total));
    if (appliedCoupon?.type === "delivery") deliveryFee = 0;
    const total = Math.max(0, subtotal + deliveryFee + SERVICE_FEE - (rewardPricing.discountAmount || 0) - couponDiscount);
    return {
      subtotal,
      deliveryFee,
      serviceFee: SERVICE_FEE,
      discount: (rewardPricing.discountAmount || 0) + couponDiscount,
      total,
    };
  }, [appliedCoupon, rewardPricing, subtotal]);

  const applyCoupon = (rawCode) => {
    const code = String(rawCode || "").trim().toUpperCase();
    const coupon = couponRules[code];
    if (!coupon) return { ok: false, message: "Invalid coupon code" };
    setAppliedCoupon(coupon);
    return { ok: true };
  };

  const goTo = (step) => {
    navigate(`/checkout/${step}`, { state: location.state || {} });
  };

  const hasUsableAddress = Boolean(locationIntelligence.address?.id && locationIntelligence.address?.source !== "default");

  const buildPaymentRecord = (orderId, method, provider, status, transactionId = "", meta = {}) =>
    createPaymentPayload({
      orderId,
      userId: user?.id || user?._id || "",
      method,
      provider,
      amount: pricing.total,
      status,
      transactionId,
      meta,
    });

  const createPaymentOnBackend = async (paymentPayload) => {
    const payment = await safeFetch(() => paymentsAPI.create(paymentPayload), null);
    if (!payment?.payment) return null;
    return payment.payment;
  };

  const finalizeOrder = async (resolvedPayment, orderId) => {
    const latestReward = selectedReward?.id ? getRewardById(selectedReward.id) : null;
    const rewardValidity = latestReward ? validateRewardUse(latestReward, checkoutItems) : { valid: false };
    const rewardForOrder = rewardValidity.valid ? latestReward : null;
    const paymentLabel = getPaymentDisplayName(paymentMethod, upiMethod);

    const orderPayload = {
      id: orderId,
      orderId,
      customerName: locationIntelligence.address?.fullName || user?.name || "ApnaGaon Customer",
      phone: locationIntelligence.address?.phone || user?.phone || "",
      customer: {
        name: locationIntelligence.address?.fullName || user?.name || "ApnaGaon Customer",
        phone: locationIntelligence.address?.phone || user?.phone || "",
      },
      address: locationIntelligence.address,
      items: checkoutItems,
      totals: pricing,
      paymentMethod: paymentLabel,
      paymentId: resolvedPayment?.id || resolvedPayment?._id || null,
      paymentStatus: resolvedPayment?.status || paymentStatus,
      payment: {
        id: resolvedPayment?.id || resolvedPayment?._id || null,
        orderId,
        method: resolvedPayment?.method || resolvePaymentMethod(paymentMethod),
        provider: resolvedPayment?.provider || (paymentMethod === PAYMENT_METHODS.COD ? "cod" : upiMethod),
        amount: pricing.total,
        status: resolvedPayment?.status || paymentStatus,
        transactionId: resolvedPayment?.transactionId || "",
        createdAt: resolvedPayment?.createdAt || new Date().toISOString(),
      },
      rewardUsed: rewardForOrder?.name || "",
      couponCode: appliedCoupon?.code || "",
      couponUsed: appliedCoupon?.code || "",
      note: locationIntelligence.address?.note || "",
      eta: locationIntelligence.deliveryEstimate,
      etaMinutes: Number.parseInt(locationIntelligence.deliveryEstimate, 10) || 30,
      status: "placed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const order = await safeFetch(() => ordersAPI.create(orderPayload), null);
    const savedOrder = saveLocalOrder({ ...orderPayload, ...(order || {}) });
    const resolvedOrderId = order?.orderId || order?.id || order?._id || savedOrder?.orderId || savedOrder?.id || savedOrder?._id || orderId;

    if (rewardForOrder?.id) markUsed(rewardForOrder.id);
    addRewardPoints(30);

    await new Promise((resolve) => window.setTimeout(resolve, 250));
    navigate(`/track-order/${resolvedOrderId || "demo-order"}`);
  };

  const processPaymentAndOrder = async () => {
    if (!checkoutItems.length || !hasUsableAddress || !paymentMethod) {
      if (!hasUsableAddress) goTo("address");
      return;
    }

    if (paymentMethod === "card") {
      setPaymentStatus(PAYMENT_STATUSES.FAILED);
      setPaymentError("Card payments are coming soon.");
      return;
    }

    setPlacingOrder(true);
    setPaymentError("");

    const orderId = `AG${Date.now().toString().slice(-8)}`;
    const method = resolvePaymentMethod(paymentMethod);
    const provider = method === PAYMENT_METHODS.COD ? "cod" : upiMethod;

    try {
      if (method === PAYMENT_METHODS.COD) {
        const paymentRecord = buildPaymentRecord(orderId, method, provider, PAYMENT_STATUSES.COD_PENDING, "");
        const backendPayment = await createPaymentOnBackend(paymentRecord);
        await finalizeOrder(backendPayment || paymentRecord, orderId);
        return;
      }

      const paymentRecord = buildPaymentRecord(orderId, method, provider, PAYMENT_STATUSES.PENDING, "", {
        gateway: "simulated",
      });
      const backendPayment = await createPaymentOnBackend(paymentRecord);

      if (backendPayment && backendPayment.status === PAYMENT_STATUSES.FAILED) {
        setPaymentStatus(PAYMENT_STATUSES.FAILED);
        setPaymentError("UPI payment failed. Please try again or switch to COD.");
        return;
      }

      if (backendPayment) {
        const transactionId = buildSimulatedTransactionId(orderId, provider);
        const verified = await safeFetch(
          () =>
            paymentsAPI.verify(backendPayment.id || backendPayment._id, {
              success: true,
              transactionId,
              gateway: "simulated",
            }),
          null
        );
        if (verified?.payment?.status === PAYMENT_STATUSES.FAILED) {
          setPaymentStatus(PAYMENT_STATUSES.FAILED);
          setPaymentError("UPI payment failed. Please try again or switch to COD.");
          return;
        }
        const resolvedPayment = verified?.payment || {
          ...backendPayment,
          status: PAYMENT_STATUSES.PAID,
          transactionId,
        };
        setPaymentStatus(PAYMENT_STATUSES.PAID);
        await finalizeOrder(resolvedPayment, orderId);
        return;
      }

      const simulatedPayment = {
        ...paymentRecord,
        id: `pay_${orderId}`,
        status: PAYMENT_STATUSES.PAID,
        transactionId: buildSimulatedTransactionId(orderId, provider),
        createdAt: new Date().toISOString(),
      };
      setPaymentStatus(PAYMENT_STATUSES.PAID);
      await finalizeOrder(simulatedPayment, orderId);
    } catch (error) {
      setPaymentStatus(PAYMENT_STATUSES.FAILED);
      setPaymentError(error?.message || "Payment failed. Please retry.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!checkoutItems.length) {
    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        <EmptyState
          title={lang === "hi" ? "No items found" : "No items found"}
          description={lang === "hi" ? "No items in cart or buy now." : "No items in cart or buy now."}
          action={() => navigate("/cart")}
          actionText={lang === "hi" ? "Go to Cart" : "Go to Cart"}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Secure Checkout</p>
            <h1 className="text-lg font-black text-slate-950">Complete your order</h1>
          </div>
        </div>

        <CheckoutStepper activeStep={activeStep} lang={lang} />

        {activeStep === "address" ? (
          <AddressStep lang={lang} locationIntelligence={locationIntelligence} onContinue={() => goTo("summary")} />
        ) : null}

        {activeStep === "summary" ? (
          <OrderSummaryStep
            lang={lang}
            address={locationIntelligence.address}
            items={checkoutItems}
            pricing={pricing}
            rewardLabel={selectedReward?.name || appliedCoupon?.label || ""}
            deliveryEstimate={locationIntelligence.deliveryEstimate}
            onChangeAddress={() => goTo("address")}
            onBackToCart={() => navigate("/cart")}
            onContinue={() => (hasUsableAddress ? goTo("payment") : goTo("address"))}
          />
        ) : null}

        {activeStep === "payment" ? (
          <PaymentStep
            lang={lang}
            pricing={pricing}
            appliedCoupon={appliedCoupon}
            paymentMethod={paymentMethod}
            upiMethod={upiMethod}
            paymentStatus={paymentStatus}
            paymentError={paymentError}
            placingOrder={placingOrder}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={() => setAppliedCoupon(null)}
            onPaymentMethodChange={setPaymentMethod}
            onUpiMethodChange={setUpiMethod}
            onPlaceOrder={processPaymentAndOrder}
            onRetryPayment={processPaymentAndOrder}
          />
        ) : null}
      </main>
    </div>
  );
};

export default CheckoutPage;
