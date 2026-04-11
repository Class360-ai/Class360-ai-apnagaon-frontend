import React from "react";

const TrendChart = ({
  title,
  subtitle,
  data = [],
  valueKey = "value",
  formatValue = (value) => value,
  accentClass = "bg-emerald-500",
  emptyLabel = "No data yet",
}) => {
  const series = Array.isArray(data) ? data : [];
  const maxValue = Math.max(0, ...series.map((item) => Number(item?.[valueKey]) || 0));

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">{subtitle}</h2>
        </div>
        <span className={`mt-1 h-3 w-3 rounded-full ${accentClass}`} />
      </div>

      {series.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {series.map((item) => {
            const rawValue = Number(item?.[valueKey]) || 0;
            const ratio = maxValue ? rawValue / maxValue : 0;
            return (
              <div key={item.label} className="rounded-[22px] bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-xs font-black text-slate-900">{formatValue(rawValue)}</p>
                </div>
                <div className="mt-3 h-32 rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                  <div className="flex h-full items-end gap-1">
                    <div
                      className={`w-full rounded-t-xl ${accentClass}`}
                      style={{ height: `${Math.max(8, Math.round(ratio * 100))}%`, opacity: 0.88 }}
                      title={`${item.label}: ${formatValue(rawValue)}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">{emptyLabel}</div>
      )}
    </section>
  );
};

export default TrendChart;
