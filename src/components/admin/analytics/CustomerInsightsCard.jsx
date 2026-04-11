import React from "react";
import { Users, MapPin } from "lucide-react";
import { formatPrice } from "../../../utils/helpers";

const Stat = ({ label, value, tone = "emerald" }) => {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };
  return (
    <div className={`rounded-[22px] p-3 ring-1 ${toneClasses[tone] || toneClasses.emerald}`}>
      <p className="text-[10px] font-black uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
};

const CustomerInsightsCard = ({ customerInsights = {}, customerGrowthSeries = [] }) => (
  <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Customers</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Customer insights</h2>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
        <Users className="h-5 w-5" />
      </span>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="New customers" value={customerInsights.newCustomers || 0} tone="emerald" />
      <Stat label="Repeat customers" value={customerInsights.repeatCustomers || 0} tone="blue" />
      <Stat label="Saved addresses" value={customerInsights.totalSavedAddresses || 0} tone="orange" />
      <Stat label="Avg order size" value={formatPrice(customerInsights.averageOrderSize || 0)} tone="slate" />
    </div>

    <div className="mt-4 grid gap-3 xl:grid-cols-2">
      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Customer growth</p>
        <div className="mt-3 flex items-end gap-2">
          {customerGrowthSeries.length ? (
            customerGrowthSeries.map((item) => (
              <div key={item.label} className="flex-1">
                <div className="flex h-28 items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-sky-500 to-emerald-500"
                    style={{ height: `${Math.max(8, Number(item.customers || 0) * 18)}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-[11px] font-black uppercase tracking-wide text-slate-400">{item.label}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">No customer growth data yet.</div>
          )}
        </div>
      </div>

      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Top villages / areas</p>
        <div className="mt-3 space-y-2">
          {(customerInsights.topVillages || []).length ? (
            customerInsights.topVillages.map((item) => (
              <div key={item.name} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-slate-100">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{item.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{item.count} orders</p>
                  </div>
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">No village data yet.</div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Total customers</p>
            <p className="mt-1 text-lg font-black text-slate-950">{customerInsights.totalCustomers || 0}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Average order</p>
            <p className="mt-1 text-lg font-black text-slate-950">{formatPrice(customerInsights.averageOrderSize || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CustomerInsightsCard;
