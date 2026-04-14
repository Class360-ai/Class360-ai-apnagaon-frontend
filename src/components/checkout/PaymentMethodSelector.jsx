import React from "react";
import { Check, CreditCard, Smartphone } from "lucide-react";

const PaymentMethodSelector = ({ value = "cod", onChange, error = "" }) => {
  const options = [
    {
      id: "cod",
      title: "Cash on Delivery",
      description: "Pay when order arrives",
      helper: "Best for local trust",
      icon: CreditCard,
      tone: "orange",
    },
    {
      id: "upi",
      title: "UPI",
      description: "Fast digital payment",
      helper: "Quick confirmation",
      icon: Smartphone,
      tone: "emerald",
    },
  ];

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Payment method</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Payment method</h2>
      </div>

      <div className="mt-4 grid gap-3">
        {options.map((option) => {
          const selected = value === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex items-center gap-3 rounded-[18px] border px-4 py-3 text-left transition ${
                selected
                  ? "border-orange-500 bg-orange-50 shadow-[0_10px_24px_rgba(249,115,22,0.08)] ring-2 ring-orange-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${option.tone === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-slate-950">{option.title}</span>
                  {selected ? <Check className="h-4 w-4 text-orange-600" /> : null}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-slate-500">{option.description}</span>
              </span>
              <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${selected ? "bg-white text-orange-700" : "bg-slate-50 text-slate-500"}`}>
                {option.helper}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-xs font-bold text-red-500">{error}</p> : null}
    </section>
  );
};

export default PaymentMethodSelector;
