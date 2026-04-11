import React from "react";
import { formatAddressLine } from "../../utils/locationHelpers";
import { formatPrice } from "../../utils/helpers";
import OrderStatusBadge from "../OrderStatusBadge";
import PaymentStatusBadge from "../checkout/PaymentStatusBadge";
import { getOrderCustomerName, getOrderPhone } from "../../utils/adminOrderHelpers";

const OrderRow = ({ order, onOpen, onStatusChange, onWhatsApp, onCall }) => {
  const orderId = order.orderId || order.id || order._id || "demo-order";
  const itemsCount = Array.isArray(order.items) ? order.items.length : 0;

  return (
    <article className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">#{orderId}</p>
          <p className="mt-1 truncate text-xs font-bold text-slate-500">
            {getOrderCustomerName(order)} · {getOrderPhone(order) || "No phone"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-3 grid gap-3 rounded-[24px] bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-600">
        <p className="line-clamp-2 text-slate-700">{formatAddressLine(order.address || {}) || "Address not saved"}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Items</p>
            <p className="text-sm font-black text-slate-950">{itemsCount}</p>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total</p>
            <p className="text-sm font-black text-slate-950">{formatPrice(order.totals?.total || 0)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700 ring-1 ring-slate-100">{order.paymentMethod || "Payment pending"}</span>
          <PaymentStatusBadge status={order.paymentStatus || order.payment?.status || "pending"} />
          {order.couponCode || order.rewardUsed ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700 ring-1 ring-emerald-100">{order.couponCode || order.rewardUsed}</span>
          ) : null}
          <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] text-orange-700 ring-1 ring-orange-100">{order.eta || `${order.etaMinutes || 30} min`}</span>
        </div>

        <p className="text-slate-400">Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Just now"}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-slate-950 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-white shadow-sm"
        >
          View details
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          disabled={!getOrderPhone(order)}
          className={`rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-wide ring-1 ${
            getOrderPhone(order) ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-100"
          }`}
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={onCall}
          disabled={!getOrderPhone(order)}
          className={`rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-wide ring-1 ${
            getOrderPhone(order) ? "bg-white text-slate-700 ring-slate-200" : "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-100"
          }`}
        >
          Call customer
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("confirmed")}
          className="rounded-full bg-orange-50 px-4 py-3 text-[11px] font-black uppercase tracking-wide text-orange-700 ring-1 ring-orange-100"
        >
          Quick confirm
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onStatusChange("preparing")}
          className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-200"
        >
          Preparing
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("out_for_delivery")}
          className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-200"
        >
          Out for delivery
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("delivered")}
          className="rounded-full bg-emerald-600 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white ring-1 ring-emerald-600"
        >
          Delivered
        </button>
        <button
          type="button"
          onClick={() => onStatusChange("cancelled")}
          className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-red-700 ring-1 ring-red-100"
        >
          Cancelled
        </button>
      </div>
    </article>
  );
};

export default OrderRow;
