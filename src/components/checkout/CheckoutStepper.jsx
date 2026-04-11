import React from "react";
import { Check } from "lucide-react";

const steps = [
  { id: "address", label: "Address" },
  { id: "summary", label: "Summary" },
  { id: "payment", label: "Payment" },
];

const labels = {
  en: {
    title: "Step",
    subtitle: "ApnaGaon Checkout",
    steps: {
      address: "Address",
      summary: "Order Summary",
      payment: "Payment",
    },
    trust: "100% Secure • COD Available • WhatsApp support",
  },
  hi: {
    title: "चरण",
    subtitle: "ApnaGaon चेकआउट",
    steps: {
      address: "पता",
      summary: "सारांश",
      payment: "भुगतान",
    },
    trust: "100% सुरक्षित • COD उपलब्ध • WhatsApp सहायता",
  },
};

const CheckoutStepper = ({ activeStep = "address", lang = "en" }) => {
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeStep));
  const copy = labels[lang] || labels.en;

  return (
    <div className="rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-emerald-100">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          {copy.title} {activeIndex + 1} {lang === "hi" ? "में से 3" : "of 3"}
        </p>
        <p className="text-xs font-bold text-slate-400">{copy.subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const active = index === activeIndex;
          const done = index < activeIndex;
          return (
            <div key={step.id} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                  done || active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className={`min-w-0 truncate text-xs font-black ${active ? "text-slate-950" : "text-slate-400"}`}>
                {copy.steps[step.id] || step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-500">
        {copy.trust}
      </p>
    </div>
  );
};

export default CheckoutStepper;
