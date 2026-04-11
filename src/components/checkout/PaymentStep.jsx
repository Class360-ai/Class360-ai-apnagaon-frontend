import React, { useMemo, useState } from "react";
import { CheckCircle2, Lock, ShieldCheck, Truck } from "lucide-react";
import CouponBox from "./CouponBox";
import PaymentMethodAccordion from "./PaymentMethodAccordion";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentFailureCard from "./PaymentFailureCard";
import PriceSummaryCard from "./PriceSummaryCard";
import SupportActions from "../SupportActions";
import { formatPrice } from "../../utils/helpers";

const copy = {
  en: {
    title: "Payments",
    subtitle: "Step 3 of 3",
    secure: "100% Secure",
    total: "Total Amount",
    note: "Fast village delivery • Easy support on WhatsApp",
    trust: "Cash on Delivery Available • WhatsApp support available",
    saved: "You saved ₹20 today",
    placeCod: "Place COD Order",
    proceedUpi: "Proceed to UPI",
    confirm: "Place Order",
    gateway: "UPI is gateway-ready. Razorpay, PhonePe, or Cashfree can be connected later.",
    doorstep: "Pay after delivery",
    next: "Order confirmation next",
    emptyHint: "Select a payment method to continue.",
    rewardLine: "Apply reward now",
    balanceLine: "Final total updates instantly",
    cardSoon: "Card payments are coming soon.",
  },
  hi: {
    title: "भुगतान",
    subtitle: "चरण 3 में से 3",
    secure: "100% सुरक्षित",
    total: "कुल राशि",
    note: "तेज़ गाँव डिलीवरी • WhatsApp पर आसान सहायता",
    trust: "COD उपलब्ध • WhatsApp सहायता उपलब्ध",
    saved: "आज आपने ₹20 बचाए",
    placeCod: "COD order दें",
    proceedUpi: "UPI पर जाएँ",
    confirm: "Order दें",
    gateway: "UPI अभी gateway-ready है। Razorpay, PhonePe, या Cashfree बाद में जोड़े जा सकते हैं।",
    doorstep: "डिलीवरी के बाद भुगतान",
    next: "अगला step: confirmation",
    emptyHint: "आगे बढ़ने के लिए payment method चुनें।",
    rewardLine: "Reward अभी लगाएँ",
    balanceLine: "Final total तुरंत अपडेट होता है",
    cardSoon: "Card payments जल्द आ रहे हैं।",
  },
};

const PaymentTotalCard = ({ lang = "en", pricing, paymentMethod, upiMethod, paymentStatus }) => {
  const text = copy[lang] || copy.en;
  const methodLine =
    paymentMethod === "upi"
      ? `${text.proceedUpi} (${upiMethod || "Google Pay"})`
      : paymentMethod === "cod"
      ? text.doorstep
      : paymentMethod === "gift"
      ? text.rewardLine
      : paymentMethod === "card"
      ? text.cardSoon
      : text.next;

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-700 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">{text.total}</p>
            <p className="mt-1 text-4xl font-black">{formatPrice(pricing.total)}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
            <Lock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <PaymentStatusBadge status={paymentStatus} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black">
          <span className="rounded-full bg-white/10 px-3 py-1 text-white">{lang === "hi" ? "100% सुरक्षित" : "100% Secure"}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white">{lang === "hi" ? "COD उपलब्ध" : "Cash on Delivery Available"}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white">{lang === "hi" ? "तेज़ गाँव डिलीवरी" : "Fast village delivery"}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white">{lang === "hi" ? "WhatsApp सहायता" : "WhatsApp support available"}</span>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center gap-3 rounded-[22px] bg-emerald-50 p-3 ring-1 ring-emerald-100">
          <Truck className="h-5 w-5 text-emerald-700" />
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">{lang === "hi" ? "डिलीवरी भरोसा" : "Delivery trust"}</p>
            <p className="truncate text-xs font-semibold text-slate-700">{text.note}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[22px] bg-orange-50 p-3 ring-1 ring-orange-100">
          <ShieldCheck className="h-5 w-5 text-orange-600" />
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-orange-700">{lang === "hi" ? "पारदर्शिता" : "Clarity"}</p>
            <p className="truncate text-xs font-semibold text-slate-700">{text.trust}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[22px] bg-slate-50 p-3 ring-1 ring-slate-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">{lang === "hi" ? "बचत" : "Savings"}</p>
            <p className="truncate text-xs font-semibold text-slate-700">{text.saved}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 pb-4">
        <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{lang === "hi" ? "भुगतान सारांश" : "Payment summary"}</p>
        <p className="mt-1 text-sm font-bold text-slate-600">{methodLine}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{text.balanceLine}</p>
      </div>
    </section>
  );
};

const PaymentStep = ({
  lang = "en",
  pricing,
  appliedCoupon,
  paymentMethod,
  upiMethod,
  paymentStatus = "pending",
  paymentError = "",
  placingOrder,
  onApplyCoupon,
  onRemoveCoupon,
  onPaymentMethodChange,
  onUpiMethodChange,
  onPlaceOrder,
  onRetryPayment,
}) => {
  const text = copy[lang] || copy.en;
  const [error, setError] = useState("");

  const ctaLabel = useMemo(() => {
    if (paymentMethod === "cod") return text.placeCod;
    if (paymentMethod === "upi") return `${text.proceedUpi} (${upiMethod || "UPI"})`;
    if (paymentMethod === "gift") return text.confirm;
    if (paymentMethod === "card") return text.cardSoon;
    return text.confirm;
  }, [paymentMethod, text, upiMethod]);

  const canPlace = Boolean(paymentMethod) && !placingOrder && paymentMethod !== "card";

  const applyCoupon = (rawCode) => {
    const result = onApplyCoupon?.(rawCode);
    if (!result?.ok) {
      setError(result?.message || "Invalid coupon code");
      return result;
    }
    setError("");
    return result;
  };

  const paymentNote =
    paymentMethod === "upi"
      ? text.gateway
      : paymentMethod === "cod"
      ? text.doorstep
      : paymentMethod === "gift"
      ? text.rewardLine
      : paymentMethod === "card"
      ? text.cardSoon
      : text.emptyHint;

  return (
    <div className="space-y-4 pb-28">
      <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-4 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">{text.subtitle}</p>
          <h1 className="mt-1 text-3xl font-black">{text.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-black text-white/95">
            <Lock className="h-4 w-4" />
            {text.secure}
          </p>
        </div>
      </section>

      <PaymentTotalCard lang={lang} pricing={pricing} paymentMethod={paymentMethod} upiMethod={upiMethod} paymentStatus={paymentStatus} />

      <PaymentMethodAccordion
        lang={lang}
        paymentMethod={paymentMethod}
        upiMethod={upiMethod}
        onPaymentMethodChange={(method) => {
          setError("");
          onPaymentMethodChange(method);
        }}
        onUpiMethodChange={(method) => {
          setError("");
          onUpiMethodChange(method);
        }}
      />

      {paymentMethod === "card" ? (
        <PaymentFailureCard
          title={lang === "hi" ? "Card payment अभी उपलब्ध नहीं है" : "Card payment is not available yet"}
          description={text.cardSoon}
          onRetry={() => onPaymentMethodChange("upi")}
          onSwitchToCod={() => onPaymentMethodChange("cod")}
        />
      ) : null}

      {paymentStatus === "failed" ? (
        <PaymentFailureCard
          title={lang === "hi" ? "Payment failed" : "Payment failed"}
          description={paymentError || (lang === "hi" ? "Payment अभी complete नहीं हुआ। कृपया retry करें।" : "We could not complete the payment. Please retry.")}
          onRetry={onRetryPayment}
          onSwitchToCod={() => onPaymentMethodChange("cod")}
        />
      ) : null}

      <CouponBox
        lang={lang}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={() => {
          setError("");
          onRemoveCoupon?.();
        }}
      />

      <PriceSummaryCard
        lang={lang}
        {...pricing}
        rewardLabel={appliedCoupon?.code ? `${lang === "hi" ? "Coupon" : "Coupon"} ${appliedCoupon.code}` : ""}
      />

      <div className="rounded-[24px] bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-100">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{lang === "hi" ? "भरोसा" : "Trust"}</p>
        <p className="mt-1 text-sm font-bold text-slate-700">{text.trust}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-black text-slate-600">
          <span className="rounded-full bg-white px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">{lang === "hi" ? "100% सुरक्षित" : "100% Secure"}</span>
          <span className="rounded-full bg-white px-3 py-1 text-orange-700 ring-1 ring-orange-100">{lang === "hi" ? "COD उपलब्ध" : "Cash on Delivery Available"}</span>
          <span className="rounded-full bg-white px-3 py-1 text-slate-700 ring-1 ring-slate-100">{lang === "hi" ? "तेज़ गाँव डिलीवरी" : "Fast village delivery"}</span>
          <span className="rounded-full bg-white px-3 py-1 text-violet-700 ring-1 ring-violet-100">{lang === "hi" ? "WhatsApp सहायता" : "WhatsApp support available"}</span>
        </div>
      </div>

      <SupportActions message="Namaste, mujhe checkout payment mein help chahiye." compact />

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600">{error}</p> : null}

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-100 bg-white/95 p-4 shadow-[0_-12px_34px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{text.total}</p>
            <p className="text-lg font-black text-slate-950">{formatPrice(pricing.total)}</p>
            <p className="truncate text-[11px] font-bold text-slate-500">{paymentNote}</p>
          </div>
          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={!canPlace}
            className="min-w-0 flex-1 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
          >
            {placingOrder ? "Placing Order..." : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
