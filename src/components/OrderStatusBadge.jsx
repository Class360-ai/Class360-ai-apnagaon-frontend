import React from "react";
import { ORDER_STATUS_META } from "../utils/orderStorage";

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  blue: "bg-sky-50 text-sky-800 ring-sky-100",
  orange: "bg-orange-50 text-orange-800 ring-orange-100",
  purple: "bg-violet-50 text-violet-800 ring-violet-100",
  red: "bg-red-50 text-red-800 ring-red-100",
};

const OrderStatusBadge = ({ status = "placed" }) => {
  const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.placed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${
        toneClass[meta.tone] || toneClass.emerald
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.tone === "red" ? "bg-red-500" : meta.tone === "orange" ? "bg-orange-500" : meta.tone === "blue" ? "bg-sky-500" : meta.tone === "purple" ? "bg-violet-500" : "bg-emerald-500"}`} />
      {meta.label}
    </span>
  );
};

export default OrderStatusBadge;
