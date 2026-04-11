import React from "react";
import { Truck, TimerReset, MapPinned, CheckCircle2 } from "lucide-react";
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

const DeliveryInsightsCard = ({ deliveryInsights = {} }) => (
  <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Delivery insights</h2>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 ring-1 ring-orange-100">
        <Truck className="h-5 w-5" />
      </span>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Average ETA" value={`${Math.round(deliveryInsights.averageEta || 0)} min`} tone="emerald" />
      <Stat label="On-time" value={deliveryInsights.ordersDeliveredOnTime || 0} tone="blue" />
      <Stat label="Delayed" value={deliveryInsights.delayedOrders || 0} tone="orange" />
      <Stat label="Best area" value={deliveryInsights.mostActiveDeliveryArea?.name || "Unknown"} tone="slate" />
    </div>

    <div className="mt-4 grid gap-3 xl:grid-cols-2">
      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery health</p>
        <div className="mt-3 rounded-[24px] bg-white p-4 ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-black text-slate-950">
              <TimerReset className="h-4 w-4 text-emerald-600" />
              On-time rate
            </span>
            <span className="text-sm font-black text-slate-950">
              {deliveryInsights.averageEta ? `${Math.max(0, Math.round(((deliveryInsights.ordersDeliveredOnTime || 0) / Math.max(1, (deliveryInsights.ordersDeliveredOnTime || 0) + (deliveryInsights.delayedOrders || 0))) * 100))}%` : "0%"}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-orange-500"
              style={{
                width: `${Math.max(
                  8,
                  Math.round(((deliveryInsights.ordersDeliveredOnTime || 0) / Math.max(1, (deliveryInsights.ordersDeliveredOnTime || 0) + (deliveryInsights.delayedOrders || 0))) * 100)
                )}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
            Based on delivered orders versus estimated ETA. Helpful for spotting areas where riders need more buffer.
          </p>
        </div>
      </div>

      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery area</p>
        <div className="mt-3 rounded-[24px] bg-white p-4 ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-black text-slate-950">{deliveryInsights.mostActiveDeliveryArea?.name || "Unknown"}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {deliveryInsights.mostActiveDeliveryArea?.count || 0} orders · {formatPrice(deliveryInsights.mostActiveDeliveryArea?.revenue || 0)}
              </p>
            </div>
            <MapPinned className="h-5 w-5 text-orange-600" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-3 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <p className="text-xs font-semibold leading-5 text-emerald-800">Better delivery planning starts with area-level demand, not just total order count.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DeliveryInsightsCard;
