import React from "react";
import { Package, Truck, CircleAlert, BadgeCheck } from "lucide-react";
import { formatPrice } from "../../utils/helpers";

const StatsCard = ({ label, value, hint, icon: Icon, tone = "emerald" }) => {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">{value}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${toneClasses[tone] || toneClasses.emerald}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
};

const AdminStatsCards = ({ metrics = {} }) => {
  const cards = [
    {
      label: "Total Orders",
      value: metrics.totalOrders || 0,
      hint: "All orders in the system",
      icon: Package,
      tone: "emerald",
    },
    {
      label: "Today Orders",
      value: metrics.todayOrders || 0,
      hint: "Placed today",
      icon: Truck,
      tone: "blue",
    },
    {
      label: "Pending Orders",
      value: metrics.pendingOrders || 0,
      hint: "Placed or confirmed",
      icon: CircleAlert,
      tone: "orange",
    },
    {
      label: "Delivered Orders",
      value: metrics.deliveredOrders || 0,
      hint: `Revenue ${formatPrice(metrics.revenue || 0)}`,
      icon: BadgeCheck,
      tone: "slate",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard key={card.label} {...card} />
      ))}
    </section>
  );
};

export default AdminStatsCards;
