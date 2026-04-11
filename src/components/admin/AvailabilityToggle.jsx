import React from "react";

const AvailabilityToggle = ({ active = false, onToggle, label = "Available" }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-wide ring-1 transition ${
      active ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-100 text-slate-500 ring-slate-100"
    }`}
  >
    <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
    {label}
  </button>
);

export default AvailabilityToggle;
