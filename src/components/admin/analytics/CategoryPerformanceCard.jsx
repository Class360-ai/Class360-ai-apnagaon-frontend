import React from "react";
import { PieChart } from "lucide-react";
import { formatPrice } from "../../../utils/helpers";

const CategoryPerformanceCard = ({ categoryPerformance = [] }) => {
  const maxPopularity = Math.max(1, ...categoryPerformance.map((item) => Number(item.popularity) || 0));

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Categories</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Category performance</h2>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
          <PieChart className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {categoryPerformance.length ? (
          categoryPerformance.map((category) => {
            const width = Math.max(8, Math.round(((Number(category.popularity) || 0) / maxPopularity) * 100));
            return (
              <div key={category.name} className="rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{category.name}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      {category.orders || 0} orders · {formatPrice(category.revenue || 0)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
                    {category.popularity || 0}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white ring-1 ring-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No category data yet.</div>
        )}
      </div>
    </section>
  );
};

export default CategoryPerformanceCard;
