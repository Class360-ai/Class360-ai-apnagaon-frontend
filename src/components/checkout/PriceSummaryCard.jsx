import React from "react";
import { formatPrice } from "../../utils/helpers";

const copy = {
  en: {
    title: "Price Details",
    subtotal: "MRP / Subtotal",
    deliveryFee: "Delivery fee",
    serviceFee: "Service fee",
    discount: "Discount / Reward",
    total: "Total Amount",
    free: "Free",
  },
  hi: {
    title: "राशि विवरण",
    subtotal: "MRP / उप-योग",
    deliveryFee: "डिलीवरी शुल्क",
    serviceFee: "सेवा शुल्क",
    discount: "छूट / रिवार्ड",
    total: "कुल राशि",
    free: "मुफ़्त",
  },
};

const PriceSummaryCard = ({ lang = "en", subtotal = 0, deliveryFee = 0, serviceFee = 0, discount = 0, rewardLabel = "", total = 0 }) => {
  const text = copy[lang] || copy.en;
  return (
    <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-base font-black text-slate-950">{text.title}</h2>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>{text.subtotal}</span>
          <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>{text.deliveryFee}</span>
          <span className="font-bold text-emerald-700">{deliveryFee > 0 ? formatPrice(deliveryFee) : text.free}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>{text.serviceFee}</span>
          <span className="font-bold text-slate-900">{serviceFee > 0 ? formatPrice(serviceFee) : text.free}</span>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-slate-500">
            <span>{rewardLabel || text.discount}</span>
            <span className="font-bold text-emerald-700">- {formatPrice(discount)}</span>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="font-black text-slate-950">{text.total}</span>
        <span className="text-xl font-black text-slate-950">{formatPrice(total)}</span>
      </div>
    </section>
  );
};

export default PriceSummaryCard;
