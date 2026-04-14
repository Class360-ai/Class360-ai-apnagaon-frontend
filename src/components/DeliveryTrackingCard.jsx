import React from "react";
import { Bike, Clock3, Phone, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { formatAddressLine } from "../utils/locationHelpers";
import { formatPrice } from "../utils/helpers";
import { ORDER_STATUS_META, getTrackingStepIndex, resolveTrackingStatus } from "../utils/orderStorage";
import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./checkout/PaymentStatusBadge";
import SupportActions from "./SupportActions";

const TRACKING_STEPS = [
  { id: "placed", label: "Order Placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "delivered", label: "Delivered" },
];

const DeliveryTrackingCard = ({ order = {} }) => {
  const resolvedStatus = resolveTrackingStatus(order.status);
  const currentIndex = Math.max(0, getTrackingStepIndex(resolvedStatus));
  const statusMeta = ORDER_STATUS_META[resolvedStatus] || ORDER_STATUS_META.placed;
  const orderId = order.orderId || order.id || order._id || "demo-order";
  const etaLabel = order.eta || `${order.etaMinutes || 30} min`;
  const totals = order.totals || {};
  const totalAmount = Number(totals.total ?? order.total ?? 0) || 0;
  const deliveryFee = Number(totals.deliveryFee ?? order.deliveryFee ?? 0) || 0;
  const riderName = order.riderName || order.riderId?.name || order.deliveryPartnerId?.name || "";
  const riderPhone = order.riderPhone || order.riderId?.phone || order.deliveryPartnerId?.phone || "";
  const riderVehicle = order.riderVehicleType || order.riderId?.vehicleType || order.riderId?.vehicle || "";

  return (
    <section className="space-y-4 rounded-[32px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-1">
        <div className="rounded-[27px] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Track Order</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{order.statusLabel || statusMeta.note || "Order in progress"}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Updates will appear here as the shop and rider move the order forward.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <OrderStatusBadge status={order.status || "placed"} />
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-orange-700">
                <Clock3 className="h-3.5 w-3.5" />
                ETA {etaLabel}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Order</p>
              <p className="mt-1 truncate font-black text-slate-950">#{orderId}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Payment</p>
              <p className="mt-1 truncate font-black text-slate-950">{order.paymentMethod || "COD"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Total</p>
              <p className="mt-1 truncate font-black text-slate-950">{formatPrice(totalAmount)}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={order.paymentStatus || order.payment?.status || "pending"} />
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
              {order.paymentMethod || order.payment?.provider || "Payment"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Timeline</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">Your order journey</h3>
          </div>
          <Truck className="h-5 w-5 text-orange-600" />
        </div>

        <div className="space-y-0">
          {TRACKING_STEPS.map((step, index) => {
            const active = index <= currentIndex;
            const completed = index < currentIndex;
            const noteCandidates = step.id === "out_for_delivery"
              ? ["out_for_delivery", "on_the_way", "picked_up", "assigned"]
              : [step.id];
            const note = noteCandidates
              .map((candidate) => order.trackingSteps?.find((item) => item.status === candidate)?.note)
              .find(Boolean);
            return (
              <div key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < TRACKING_STEPS.length - 1 ? (
                  <span className={`absolute left-[7px] top-5 h-[calc(100%-18px)] w-0.5 ${completed ? "bg-emerald-500" : "bg-slate-200"}`} />
                ) : null}
                <span
                  className={`relative z-10 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ${
                    active ? "bg-emerald-600 ring-emerald-100" : "bg-slate-300 ring-slate-100"
                  }`}
                >
                  {completed ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-black ${active ? "text-slate-950" : "text-slate-400"}`}>{step.label}</p>
                  <p className="text-xs font-semibold text-slate-500">{note || (active ? "Current step" : "Waiting for update")}</p>
                </div>
              </div>
            );
          })}
        </div>

        {order.status === "cancelled" ? (
          <div className="mt-2 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">This order was cancelled. WhatsApp support can help with a replacement or refund question.</div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            Items
          </div>
          <p className="mt-2 text-sm font-black text-slate-950">
            {order.items?.length
              ? order.items.slice(0, 2).map((item) => item.name).join(", ") + (order.items.length > 2 ? ` +${order.items.length - 2} more` : "")
              : "No items available"}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {deliveryFee ? `Delivery fee ${formatPrice(deliveryFee)}` : "Free delivery where available"}
          </p>
        </div>

        <div className="rounded-[24px] bg-white p-4 ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Delivery Address
          </div>
          <p className="mt-2 text-sm font-black text-slate-950">{order.address?.fullName || order.customerName || "ApnaGaon Customer"}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{formatAddressLine(order.address || {}) || "Address pending"}</p>
          {order.address?.phone ? <p className="mt-1 text-xs font-bold text-orange-700">{order.address.phone}</p> : null}
        </div>
      </div>

      {riderName || riderPhone || order.deliveryPartnerId || order.riderId ? (
        <div className="rounded-[24px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-600 p-2 text-white">
                  <Bike className="h-4 w-4" />
                </span>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Delivery Partner</p>
              </div>
              <p className="mt-2 text-sm font-black text-emerald-950">{riderName || "Delivery partner assigned"}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-800">Rider is on the way 🚚</p>
              <p className="mt-1 text-xs font-semibold text-emerald-800">Assigned once the shop hands over the order.</p>
              {riderVehicle ? <p className="mt-1 text-xs font-bold text-emerald-700">{riderVehicle}</p> : null}
              {riderPhone ? <p className="mt-1 text-xs font-semibold text-emerald-800">{riderPhone}</p> : null}
            </div>
            {riderPhone ? (
              <a
                href={`tel:${riderPhone}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm"
                aria-label="Call rider"
              >
                <Phone className="h-4 w-4" />
                Call Rider
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <SupportActions message={`Namaste / Hello ApnaGaon,\nI need help with my order.\n\nOrder ID: ${orderId}\nStatus: ${order.status || "placed"}\nTotal: ${formatPrice(totalAmount)}`} compact />
    </section>
  );
};

export default DeliveryTrackingCard;
