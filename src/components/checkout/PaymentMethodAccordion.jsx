import React from "react";
import { CreditCard, Gift, IndianRupee, Smartphone } from "lucide-react";
import UPIOptionsList from "./UPIOptionsList";

const copy = {
  en: {
    upiTitle: "UPI",
    upiSubtitle: "Gateway-ready, safely simulated now",
    codTitle: "Cash on Delivery",
    codSubtitle: "Always available",
    giftTitle: "Gift Card / Coupon",
    giftSubtitle: "Apply reward now and pay the balance in-app",
    cardTitle: "Card Payment",
    cardSubtitle: "Gateway placeholder for later",
    upiMethods: "Choose your UPI app",
  },
  hi: {
    upiTitle: "UPI",
    upiSubtitle: "अभी सुरक्षित simulation, gateway-ready",
    codTitle: "कैश ऑन डिलीवरी",
    codSubtitle: "हमेशा उपलब्ध",
    giftTitle: "Gift Card / Coupon",
    giftSubtitle: "Reward अभी लगाएँ और बाकी in-app pay करें",
    cardTitle: "Card Payment",
    cardSubtitle: "बाद में gateway जोड़ने के लिए placeholder",
    upiMethods: "UPI ऐप चुनें",
  },
};

const methodClass = (selected) =>
  `w-full rounded-[24px] border p-4 text-left shadow-sm transition ${
    selected
      ? "border-emerald-600 bg-emerald-50 shadow-emerald-100 ring-2 ring-emerald-100"
      : "border-slate-100 bg-white hover:border-emerald-200"
  }`;

const RadioDot = ({ selected }) => (
  <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"}`}>
    {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
  </span>
);

const PaymentMethodAccordion = ({ lang = "en", paymentMethod, upiMethod, onPaymentMethodChange, onUpiMethodChange }) => {
  const text = copy[lang] || copy.en;
  return (
    <section className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onPaymentMethodChange("upi")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onPaymentMethodChange("upi");
        }}
        className={methodClass(paymentMethod === "upi")}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Smartphone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-950">{text.upiTitle}</h3>
            <p className="text-xs font-semibold text-slate-500">{text.upiSubtitle}</p>
          </div>
          <RadioDot selected={paymentMethod === "upi"} />
        </div>
        {paymentMethod === "upi" ? (
          <p className="mt-3 text-[11px] font-black uppercase tracking-wide text-slate-400">{text.upiMethods}</p>
        ) : null}
        {paymentMethod === "upi" ? (
          <div className="mt-3">
            <UPIOptionsList provider={upiMethod} onSelect={(method) => onUpiMethodChange(method)} />
          </div>
        ) : null}
      </div>

      <button type="button" onClick={() => onPaymentMethodChange("cod")} className={`flex items-center gap-3 ${methodClass(paymentMethod === "cod")}`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <IndianRupee className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-950">{text.codTitle}</h3>
          <p className="text-xs font-semibold text-slate-500">{text.codSubtitle}</p>
        </div>
        <RadioDot selected={paymentMethod === "cod"} />
      </button>

      <button type="button" onClick={() => onPaymentMethodChange("gift")} className={`flex items-center gap-3 ${methodClass(paymentMethod === "gift")}`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Gift className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-950">{text.giftTitle}</h3>
          <p className="text-xs font-semibold text-slate-500">{text.giftSubtitle}</p>
        </div>
        <RadioDot selected={paymentMethod === "gift"} />
      </button>

      <button type="button" onClick={() => onPaymentMethodChange("card")} className={`flex items-center gap-3 ${methodClass(paymentMethod === "card")}`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <CreditCard className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-950">{text.cardTitle}</h3>
          <p className="text-xs font-semibold text-slate-500">{text.cardSubtitle}</p>
        </div>
        <RadioDot selected={paymentMethod === "card"} />
      </button>
    </section>
  );
};

export default PaymentMethodAccordion;
