import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState";
import DeliveryTrackingCard from "../components/DeliveryTrackingCard";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/checkout/PaymentStatusBadge";
import SupportActions from "../components/SupportActions";
import { formatPrice } from "../utils/helpers";
import { formatAddressLine } from "../utils/locationHelpers";
import { advanceDemoOrderStatus } from "../utils/orderTracking";
import { normalizeOrder, ORDER_UPDATED_EVENT } from "../utils/orderStorage";
import { getOrderById } from "../services/orderService";

const formatOrderDate = (value) => {
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

const getItemsLabel = (items = []) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return "No items available";
  return list.slice(0, 3).map((item) => item.name).filter(Boolean).join(", ") + (list.length > 3 ? ` +${list.length - 3} more` : "");
};

const safeTotals = (order = {}) => {
  const totals = order.totals || {};
  const subtotal = Number(totals.subtotal ?? order.subtotal ?? 0) || 0;
  const deliveryFee = Number(totals.deliveryFee ?? order.deliveryFee ?? 0) || 0;
  const packagingFee = Number(totals.packagingFee ?? order.packagingFee ?? 0) || 0;
  const discount = Number(totals.discount ?? order.discount ?? 0) || 0;
  const total = Number(totals.total ?? order.total ?? Math.max(0, subtotal + deliveryFee + packagingFee - discount)) || 0;
  return { subtotal, deliveryFee, packagingFee, discount, total };
};

const StatusTimeline = ({ order }) => {
  const steps = [
    { id: "whatsapp_pending", label: "WhatsApp pending" },
    { id: "placed", label: "Order placed" },
    { id: "confirmed", label: "Shop confirmed" },
    { id: "preparing", label: "Preparing order" },
    { id: "out_for_delivery", label: "Out for delivery" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];
  const currentStatus = String(order?.status || "placed");
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentStatus));
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Status timeline</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Your order journey</h2>
        </div>
        <Sparkles className="h-5 w-5 text-orange-600" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const active = step.id === currentStatus;
          const completed = index < currentIndex && !isCancelled;
          const cancelledActive = isCancelled && step.id === "cancelled";
          return (
            <span
              key={step.id}
              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${
                active || cancelledActive
                  ? cancelledActive
                    ? "bg-red-600 text-white ring-red-100"
                    : "bg-emerald-600 text-white ring-emerald-100"
                  : completed
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    : "bg-white text-slate-500 ring-slate-100"
              }`}
            >
              {step.label}
            </span>
          );
        })}
      </div>

      <div className="mt-4 space-y-0">
        {steps.map((step, index) => {
          const active = step.id === currentStatus;
          const completed = index < currentIndex && !isCancelled;
          const pending = index > currentIndex && !isCancelled;
          const cancelledActive = isCancelled && step.id === "cancelled";
          return (
            <div key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {index < steps.length - 1 ? (
                <span className={`absolute left-[7px] top-5 h-[calc(100%-18px)] w-0.5 ${completed || active ? "bg-emerald-500" : "bg-slate-200"}`} />
              ) : null}
              <span
                className={`relative z-10 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ${
                  active || cancelledActive
                    ? cancelledActive
                      ? "bg-red-600 ring-red-100"
                      : "bg-emerald-600 ring-emerald-100"
                    : "bg-slate-300 ring-slate-100"
                }`}
              >
                {completed ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : null}
                {cancelledActive ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-black ${active || cancelledActive ? "text-slate-950" : "text-slate-400"}`}>{step.label}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {cancelledActive ? "Order was cancelled" : active ? "Live update" : pending ? "Pending" : "Completed"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {isCancelled ? (
        <div className="mt-2 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">
          This order was cancelled. WhatsApp support can help with a replacement or refund question.
        </div>
      ) : null}
    </div>
  );
};

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [demoNote, setDemoNote] = useState("");

  const loadOrder = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      setNotFound(false);

      const resolvedOrderId = String(orderId || location.state?.orderId || location.state?.order?.orderId || location.state?.order?.id || "").trim();
      console.debug("[TrackOrder] route orderId:", resolvedOrderId || "(missing)");

      if (!resolvedOrderId) {
        setOrder(null);
        setNotFound(true);
        return;
      }

      const stateOrder = location.state?.order ? normalizeOrder(location.state.order) : null;
      let resolvedOrder = stateOrder && (stateOrder.orderId === resolvedOrderId || stateOrder.id === resolvedOrderId) ? stateOrder : null;

      if (!resolvedOrder) {
        resolvedOrder = await getOrderById(resolvedOrderId);
      }

      console.debug("[TrackOrder] matched order:", resolvedOrder || null);

      if (!resolvedOrder) {
        setOrder(null);
        setNotFound(true);
        return;
      }

      setOrder(normalizeOrder(resolvedOrder));
    } catch {
      setNotFound(true);
      setOrder(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();

    const handleOrderUpdate = (event) => {
      const next = event.detail;
      if (!next) return;
      const nextId = next.orderId || next.id || next._id;
      if (orderId && nextId !== orderId) return;
      setOrder(normalizeOrder(next));
    };

    const refresh = () => loadOrder({ silent: true });
    window.addEventListener(ORDER_UPDATED_EVENT, handleOrderUpdate);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(ORDER_UPDATED_EVENT, handleOrderUpdate);
      window.removeEventListener("storage", refresh);
    };
  }, [orderId, location.state?.order]);

  const displayOrder = useMemo(() => (order ? normalizeOrder(order) : null), [order]);
  const orderLabel = displayOrder?.orderId || displayOrder?.id || orderId || "";
  const totals = useMemo(() => safeTotals(displayOrder), [displayOrder]);
  const orderSource = String(displayOrder?.source || "").toLowerCase();
  const status = String(displayOrder?.status || "placed");
  const whatsappOrder = status === "whatsapp_pending" || orderSource === "whatsapp";
  const etaLabel = displayOrder?.eta || `${displayOrder?.etaMinutes || 30} min`;
  const paymentLabel = displayOrder?.paymentMethod || displayOrder?.payment?.provider || "Cash on Delivery";
  const supportMessage = `Namaste ApnaGaon,\n\nMujhe apne order mein help chahiye.\n\nOrder ID: ${orderLabel}\nStatus: ${displayOrder?.status || "placed"}\nPayment: ${paymentLabel}\nTotal: ${formatPrice(totals.total)}`;

  const handleAdvanceDemo = () => {
    const nextOrder = advanceDemoOrderStatus(orderLabel);
    if (nextOrder) {
      setOrder(nextOrder);
      setDemoNote("Demo status updated locally.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
        <div className="mx-auto max-w-md space-y-4">
          <div className="rounded-[24px] bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-100">
            Loading your order...
          </div>
          <div className="h-24 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100" />
          <div className="h-80 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100" />
        </div>
      </div>
    );
  }

  if (notFound && !order) {
    const missingId = String(orderId || location.state?.orderId || "").trim();
    return (
      <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
        <div className="mx-auto max-w-md space-y-4">
          <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Tracking</p>
              <h1 className="text-lg font-black text-slate-950">Order tracking</h1>
            </div>
          </div>
          <EmptyState
            title={missingId ? "Order not found" : "No order selected"}
            description={
              missingId
                ? `We could not find order ID ${missingId}. Please check your orders or go back to checkout.`
                : "Please open a placed order from checkout or your orders page."
            }
            action={() => navigate(missingId ? "/orders" : "/checkout")}
            actionText={missingId ? "Go to Orders" : "Back to Checkout"}
          />
          <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Next step</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {missingId
                ? "If you just placed this order, give it a moment and check Orders again."
                : "Go back to checkout to place a new order or review your cart."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100"
              >
                Back to Checkout
              </button>
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200"
              >
                View Orders
              </button>
            </div>
          </div>
          {missingId ? (
            <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
              Missing order ID: <span className="font-black text-slate-800">{missingId}</span>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#f8fafc_55%,_#fff7ed)] px-4 pb-32 pt-4">
      <main className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Tracking</p>
            <h1 className="truncate text-lg font-black text-slate-950">Track Your Order</h1>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-500 p-1 shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
          <div className="rounded-[31px] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
                  {status === "whatsapp_pending"
                    ? "Waiting for WhatsApp confirmation"
                    : status === "cancelled"
                      ? "Order cancelled"
                      : displayOrder?.status === "placed" && location.state?.success
                        ? "Order placed successfully"
                        : "Live tracking"}
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">#{orderLabel || "Pending"}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{formatOrderDate(displayOrder?.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <OrderStatusBadge status={status || "placed"} />
                <PaymentStatusBadge status={displayOrder?.paymentStatus || displayOrder?.payment?.status || "pending"} />
              </div>
            </div>

            <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Estimated delivery</p>
              <p className="mt-1 text-lg font-black text-slate-950">{etaLabel}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {status === "whatsapp_pending"
                  ? "Tracking will be shared in WhatsApp after confirmation."
                  : status === "cancelled"
                    ? "This order was cancelled. Support is ready if you need help."
                    : "This tracking view updates from saved order data."}
              </p>
            </div>

            {location.state?.success ? (
              <div className="mt-4 flex items-start gap-3 rounded-[22px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <span>Your order has been placed successfully. Keep this page open for tracking updates.</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/track-order/${orderLabel}`)}
                    className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
                  >
                    Track Your Order
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Customer</p>
              <p className="mt-1 text-sm font-black text-slate-950">{displayOrder.address?.fullName || displayOrder.customerName || "ApnaGaon Customer"}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Total</p>
              <p className="mt-1 text-sm font-black text-slate-950">{formatPrice(totals.total)}</p>
            </div>
          </div>
          <div className="mt-3 rounded-[22px] bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Address</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{formatAddressLine(displayOrder.address || {}) || "Address pending"}</p>
            {displayOrder.address?.note ? <p className="mt-2 text-xs font-bold text-orange-700">Note: {displayOrder.address.note}</p> : null}
          </div>
          <div className="mt-3 rounded-[22px] bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Items</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{getItemsLabel(displayOrder.items)}</p>
            <p className="mt-2 text-xs font-semibold text-slate-500">Payment: {paymentLabel}</p>
          </div>
        </section>

        <DeliveryTrackingCard order={displayOrder} />

        <StatusTimeline order={displayOrder} />

        <section className="rounded-[28px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-emerald-950">Need help with this order?</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">WhatsApp support can confirm the order, address, and next step quickly.</p>
            </div>
          </div>
          <div className="mt-4">
            <SupportActions message={supportMessage} compact />
          </div>
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100"
          >
            View all orders
          </button>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100"
          >
            Back to Cart
          </button>
        </div>

        {displayOrder?.source === "app" && status !== "delivered" && status !== "cancelled" ? (
          <button
            type="button"
            onClick={handleAdvanceDemo}
            className="w-full rounded-full bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 ring-1 ring-orange-100"
          >
            Advance demo status
          </button>
        ) : null}

        {demoNote ? (
          <div className="rounded-[22px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
            {demoNote}
          </div>
        ) : null}

        {whatsappOrder ? (
          <div className="rounded-[22px] bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
            Tracking will be shared in WhatsApp after confirmation.
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default TrackOrder;
