import React from "react";

const STATUS_MAP = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-100" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 ring-rose-100" },
  suspended: { label: "Suspended", className: "bg-slate-100 text-slate-700 ring-slate-200" },
};

const ShopStatusBadge = ({ status = "pending" }) => {
  const meta = STATUS_MAP[String(status || "pending").toLowerCase()] || STATUS_MAP.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${meta.className}`}>
      {meta.label}
    </span>
  );
};

export default ShopStatusBadge;
