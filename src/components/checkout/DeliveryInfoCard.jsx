import React from "react";
import { Headphones, ShieldCheck, Truck } from "lucide-react";

const copy = {
  en: {
    tag: "Delivery estimate",
    points: ["Easy doorstep delivery", "Local partner support", "WhatsApp confirmation available"],
  },
  hi: {
    tag: "डिलीवरी अनुमान",
    points: ["आसान दरवाज़े तक डिलीवरी", "लोकल पार्टनर सहायता", "WhatsApp confirmation उपलब्ध"],
  },
};

const DeliveryInfoCard = ({ lang = "en", eta = "30 min" }) => {
  const text = copy[lang] || copy.en;
  const points = [
    { icon: Truck, label: text.points[0] },
    { icon: Headphones, label: text.points[1] },
    { icon: ShieldCheck, label: text.points[2] },
  ];
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
        {text.tag}: {eta}
      </div>
      <div className="grid gap-2">
        {points.map((point) => {
          const TrustIcon = point.icon;
          return (
          <div key={point.label} className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <TrustIcon className="h-4 w-4 text-emerald-600" />
            <span>{point.label}</span>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default DeliveryInfoCard;
