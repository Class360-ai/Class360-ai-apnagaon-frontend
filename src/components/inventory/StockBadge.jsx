import React from "react";

const StockBadge = ({ stock = 0, available = true, minStockAlert = 5 }) => {
  const safeStock = Number(stock) || 0;
  const out = !available || safeStock <= 0;
  const low = !out && safeStock <= minStockAlert;
  const label = out ? "Out of Stock" : low ? `Low Stock: ${safeStock}` : `In Stock: ${safeStock}`;
  const classes = out
    ? "bg-red-50 text-red-700 ring-red-100"
    : low
    ? "bg-orange-50 text-orange-700 ring-orange-100"
    : "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ring-1 ${classes}`}>{label}</span>;
};

export default StockBadge;
