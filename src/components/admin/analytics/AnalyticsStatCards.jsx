import React from "react";
import { formatPrice } from "../../../utils/helpers";

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  slate: "bg-slate-50 text-slate-700 ring-slate-100",
};

const AnalyticsStatCards = ({ stats = [] }) => (
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {stats.map((stat) => (
      <article key={stat.label} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">{stat.label}</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">
              {typeof stat.value === "number" && stat.kind === "currency" ? formatPrice(stat.value) : stat.value}
            </h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{stat.hint}</p>
          </div>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${toneClass[stat.tone] || toneClass.emerald}`}>
            {stat.icon}
          </span>
        </div>
      </article>
    ))}
  </section>
);

export default AnalyticsStatCards;
