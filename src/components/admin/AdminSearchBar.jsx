import React from "react";
import { Plus, Search } from "lucide-react";

const AdminSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  actionLabel,
  onAction,
  filters = [],
  activeFilter = "",
  onFilterChange,
}) => {
  return (
    <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none placeholder:text-slate-400"
          />
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-sm shadow-emerald-100"
          >
            <Plus className="h-4 w-4" />
            {actionLabel}
          </button>
        ) : null}
      </div>

      {filters.length ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const active = activeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => onFilterChange(filter.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide ring-1 transition ${
                  active ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-600 ring-slate-100"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default AdminSearchBar;
