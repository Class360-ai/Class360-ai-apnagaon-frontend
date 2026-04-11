import React from "react";
import { X, CheckCircle2, Clock3, MapPin, MessageCircle, Phone, Truck } from "lucide-react";
import { formatAddressLine } from "../../utils/locationHelpers";
import { formatPrice } from "../../utils/helpers";
import { ORDER_STATUS_META } from "../../utils/orderStorage";
import OrderStatusBadge from "../OrderStatusBadge";
import PaymentStatusBadge from "../checkout/PaymentStatusBadge";

const TRACKING_STEPS = [
  { id: "placed", label: "Order Placed" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "delivered", label: "Delivered" },
];

const STATUS_INDEX = TRACKING_STEPS.reduce((acc, step, index) => {
  acc[step.id] = index;
  return acc;
}, {});

const OrderDetailModal = ({ order, onClose, onStatusChange, onWhatsApp, onCall }) => {
  if (!order) return null;
  const orderId = order.orderId || order.id || order._id || "demo-order";
  const currentIndex = order.status === "cancelled" ? -1 : STATUS_INDEX[order.status] ?? 0;
  const totals = order.totals || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const eta = order.eta || `${order.etaMinutes || 30} min`;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Order details</p>
            <h2 className="mt-1 truncate text-xl font-black text-slate-950">#{orderId}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-orange-700">
                <Clock3 className="h-3.5 w-3.5" />
                ETA {eta}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Close detail modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-4 py-4">
          <section className="rounded-[26px] bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Customer</p>
            <div className="mt-2 grid gap-2 text-sm font-semibold text-slate-700">
              <p className="font-black text-slate-950">{order.customerName || order.customer?.name || "ApnaGaon Customer"}</p>
              <p>{order.phone || order.customer?.phone || order.address?.phone || "Phone not available"}</p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                <span>{formatAddressLine(order.address || {}) || "Address not available"}</span>
              </p>
              {order.address?.note ? <p className="text-orange-700">Note: {order.address.note}</p> : null}
            </div>
          </section>

          <section className="mt-3 rounded-[26px] bg-white p-4 ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Items</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id || item.name} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{item.name || "Item"}</p>
                      <p className="text-xs font-semibold text-slate-500">Qty {item.quantity || item.qty || 1}</p>
                    </div>
                    <p className="text-sm font-black text-slate-950">
                      {formatPrice((Number(item.price) || 0) * (Number(item.quantity || item.qty) || 1))}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No item details available for this order.</div>
              )}
            </div>
          </section>

          <section className="mt-3 rounded-[26px] bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Payment and totals</p>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
              <div className="flex items-center justify-between gap-3">
                <span>Subtotal</span>
                <span className="font-black text-slate-950">{formatPrice(totals.subtotal || 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Delivery fee</span>
                <span className="font-black text-slate-950">{totals.deliveryFee ? formatPrice(totals.deliveryFee) : "Free"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Discount / reward</span>
                <span className="font-black text-emerald-700">- {formatPrice(totals.discount || 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base">
                <span className="font-black text-slate-950">Total</span>
                <span className="font-black text-slate-950">{formatPrice(totals.total || 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Payment method</span>
                <span className="font-black text-slate-950">{order.paymentMethod || order.payment?.provider || "Cash on Delivery"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Payment status</span>
                <PaymentStatusBadge status={order.paymentStatus || order.payment?.status || "pending"} />
              </div>
            </div>
          </section>

          <section className="mt-3 rounded-[26px] bg-white p-4 ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Timeline</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Order movement</h3>
              </div>
              <Truck className="h-5 w-5 text-orange-600" />
            </div>

            <div className="mt-4 space-y-0 rounded-[24px] bg-slate-50 p-3">
              {TRACKING_STEPS.map((step, index) => {
                const active = index <= currentIndex;
                const completed = index < currentIndex;
                const note = order.trackingSteps?.find((item) => item.status === step.id)?.note || ORDER_STATUS_META[step.id]?.note;
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
                      {completed ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : null}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm font-black ${active ? "text-slate-950" : "text-slate-400"}`}>{step.label}</p>
                      <p className="text-xs font-semibold text-slate-500">{note || "Waiting for update"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-3 rounded-[26px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Quick actions</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onStatusChange("confirmed")}
                className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-100"
              >
                Mark confirmed
              </button>
              <button
                type="button"
                onClick={() => onStatusChange("preparing")}
                className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-100"
              >
                Mark preparing
              </button>
              <button
                type="button"
                onClick={() => onStatusChange("out_for_delivery")}
                className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-100"
              >
                Mark out for delivery
              </button>
              <button
                type="button"
                onClick={() => onStatusChange("delivered")}
                className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white ring-1 ring-emerald-600"
              >
                Mark delivered
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onWhatsApp}
                disabled={!order.phone && !order.customer?.phone && !order.address?.phone}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black ${
                  order.phone || order.customer?.phone || order.address?.phone
                    ? "bg-emerald-600 text-white"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button
                type="button"
                onClick={onCall}
                disabled={!order.phone && !order.customer?.phone && !order.address?.phone}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black ${
                  order.phone || order.customer?.phone || order.address?.phone
                    ? "bg-white text-slate-900 ring-1 ring-slate-100"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                <Phone className="h-4 w-4 text-orange-600" />
                Call
              </button>
            </div>
          </section>
        </div>

        <div className="border-t border-slate-100 px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-slate-950 px-4 py-4 text-sm font-black text-white shadow-lg shadow-slate-200"
          >
            Close details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
