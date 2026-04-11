import React from "react";
import { CalendarClock, MapPin, Phone, Store } from "lucide-react";
import OrderStatusBadge from "../../OrderStatusBadge";

const DeliveryAssignmentCard = ({ order, partner, onAssign, onOpen, onCallCustomer, onCallShop }) => {
  const assigned = Boolean(order.deliveryPartnerId || order.riderId);
  const canCallCustomer = Boolean(order.phone || order.customer?.phone);
  const canCallShop = Boolean(order.shopPhone || order.storePhone);

  return (
    <article className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-950">#{order.orderId || order.id || order._id}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerName || order.customer?.name || "Customer"}</p>
        </div>
        <OrderStatusBadge status={order.status || "placed"} />
      </div>

      <div className="mt-3 grid gap-2 rounded-[24px] bg-slate-50 p-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
        <p className="flex items-center gap-2"><Store className="h-4 w-4 text-emerald-600" />{order.shopName || order.shop?.name || "Shop not set"}</p>
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-600" />{order.address?.area || order.address?.city || "Address not set"}</p>
        <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-sky-600" />{order.paymentMethod || "Payment pending"} · {order.total || order.totals?.total || 0}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${assigned ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-amber-100"}`}>
          {assigned ? `Assigned to ${order.riderName || partner?.name || "partner"}` : "Unassigned"}
        </span>
        {assigned ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
            {order.assignedAt ? new Date(order.assignedAt).toLocaleDateString() : "No assigned time"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onOpen} className="rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-100">
          Open
        </button>
        <button type="button" onClick={onCallCustomer} disabled={!canCallCustomer} className="rounded-full bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40">
          <Phone className="mr-2 inline h-4 w-4 text-orange-600" />
          Call customer
        </button>
        <button type="button" onClick={onCallShop} disabled={!canCallShop} className="rounded-full bg-white px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40">
          <Store className="mr-2 inline h-4 w-4 text-emerald-600" />
          Call shop
        </button>
        {!assigned ? (
          <button type="button" onClick={onAssign} className="rounded-full bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-sm shadow-emerald-100">
            Assign rider
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default DeliveryAssignmentCard;
