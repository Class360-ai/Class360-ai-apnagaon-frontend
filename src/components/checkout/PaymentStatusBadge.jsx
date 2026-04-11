import React from "react";
import { getPaymentStatusLabel, getPaymentStatusTone } from "../../utils/paymentHelpers";

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  orange: "bg-orange-50 text-orange-800 ring-orange-100",
  red: "bg-red-50 text-red-800 ring-red-100",
  violet: "bg-violet-50 text-violet-800 ring-violet-100",
  slate: "bg-slate-50 text-slate-700 ring-slate-100",
};

const PaymentStatusBadge = ({ status = "pending" }) => {
  const tone = getPaymentStatusTone(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${toneClass[tone] || toneClass.slate}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone === "red" ? "bg-red-500" : tone === "orange" ? "bg-orange-500" : tone === "violet" ? "bg-violet-500" : tone === "emerald" ? "bg-emerald-500" : "bg-slate-400"}`} />
      {getPaymentStatusLabel(status)}
    </span>
  );
};

export default PaymentStatusBadge;
