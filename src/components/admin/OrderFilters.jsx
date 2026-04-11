import React from "react";
import { ORDER_STATUSES } from "../../utils/orderStorage";

const FILTERS = ["all", ...ORDER_STATUSES];

const OrderFilters = ({ filter, setFilter, counts = {} }) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {FILTERS.map((status) => {
      const active = filter === status;
      const count = status === "all" ? counts.all || 0 : counts[status] || 0;
      return (
        <button
          key={status}
          type="button"
          onClick={() => setFilter(status)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-black capitalize ring-1 transition ${
            active ? "bg-emerald-600 text-white ring-emerald-600 shadow-sm shadow-emerald-100" : "bg-white text-slate-600 ring-slate-100 hover:bg-slate-50"
          }`}
        >
          {status.replaceAll("_", " ")} <span className={active ? "text-white/80" : "text-slate-400"}>({count})</span>
        </button>
      );
    })}
  </div>
);

export default OrderFilters;
