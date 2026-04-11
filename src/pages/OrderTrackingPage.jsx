import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import DeliveryTrackingCard from "../components/DeliveryTrackingCard";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/checkout/PaymentStatusBadge";
import { ordersAPI, safeFetch } from "../utils/api";
import { getLocalOrderById, ORDER_UPDATED_EVENT } from "../utils/orderStorage";

const fallbackOrder = {
  id: "demo-order",
  orderId: "demo-order",
  status: "preparing",
  statusLabel: "Your order is being prepared",
  etaMinutes: 30,
  riderName: "Assigned after pickup",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  trackingSteps: [
    { status: "placed", note: "Order received" },
    { status: "confirmed", note: "Shop confirmed your order" },
    { status: "preparing", note: "Items are being packed" },
  ],
};

const formatLastUpdated = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      const localOrder = getLocalOrderById(id);
      const data = id ? await safeFetch(() => ordersAPI.getById(id), null) : null;
      if (!mounted) return;
      setOrder(data || localOrder || fallbackOrder);
    };

    loadOrder();
    const pollTimer = window.setInterval(loadOrder, 12000);

    const syncOrder = (event) => {
      const nextOrder = event.detail;
      if (!nextOrder || (id && nextOrder.id !== id && nextOrder._id !== id && nextOrder.orderId !== id)) return;
      setOrder(nextOrder);
    };

    window.addEventListener(ORDER_UPDATED_EVENT, syncOrder);
    window.addEventListener("storage", loadOrder);

    return () => {
      mounted = false;
      window.clearInterval(pollTimer);
      window.removeEventListener(ORDER_UPDATED_EVENT, syncOrder);
      window.removeEventListener("storage", loadOrder);
    };
  }, [id]);

  const displayOrder = useMemo(() => order || fallbackOrder, [order]);
  const resolvedOrderId = displayOrder.orderId || displayOrder.id || id || "demo-order";

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
          <div className="bg-gradient-to-r from-emerald-600 to-orange-500 px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl bg-white/15 p-3 text-white backdrop-blur-sm"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Tracking</p>
                <p className="mt-1 text-sm font-semibold text-white/90">Live status updates from shop, rider and backend</p>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-white/75">Order #{resolvedOrderId}</p>
                <h1 className="mt-1 text-2xl font-black text-white">Track Delivery</h1>
              </div>
              <CheckCircle2 className="h-9 w-9 shrink-0 text-white" />
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={displayOrder.status || "placed"} />
              <PaymentStatusBadge status={displayOrder.paymentStatus || displayOrder.payment?.status || "pending"} />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                Updated {formatLastUpdated(displayOrder.updatedAt || displayOrder.createdAt)}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              This page stays connected to your order, so when the shop or rider moves the status forward, the timeline updates here too.
            </p>
          </div>
        </div>

        <DeliveryTrackingCard order={displayOrder} />
      </div>
    </div>
  );
};

export default OrderTrackingPage;
