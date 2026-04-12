import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import DeliveryTrackingCard from "../components/DeliveryTrackingCard";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/checkout/PaymentStatusBadge";
import { ordersAPI } from "../utils/api";
import { getLocalOrderById, ORDER_UPDATED_EVENT, normalizeOrder } from "../utils/orderStorage";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const loadOrder = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setLoading(false);
        setNotFound(true);
        setOrder(null);
        stopPolling();
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        setError("");
        setNotFound(false);

        const backendOrder = await ordersAPI.getById(id);
        const nextOrder = normalizeOrder(backendOrder);
        setOrder(nextOrder);

        if (nextOrder.status === "delivered") {
          stopPolling();
        }
      } catch (fetchError) {
        const localOrder = getLocalOrderById(id);
        if (localOrder) {
          const nextOrder = normalizeOrder(localOrder);
          setOrder(nextOrder);
          setNotFound(false);
          setError("");
          if (nextOrder.status === "delivered") {
            stopPolling();
          }
        } else {
          const message = fetchError?.message || "Order could not be loaded";
          const isNotFound = /404|not found/i.test(message);
          setOrder(null);
          setNotFound(isNotFound);
          setError(message);
          if (isNotFound) {
            stopPolling();
          }
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [id, stopPolling]
  );

  useEffect(() => {
    loadOrder();
    pollRef.current = window.setInterval(() => loadOrder({ silent: true }), 10000);

    const syncOrder = (event) => {
      const nextOrder = event.detail;
      if (!nextOrder || (id && nextOrder.id !== id && nextOrder._id !== id && nextOrder.orderId !== id)) return;
      const normalized = normalizeOrder(nextOrder);
      setOrder(normalized);
      if (normalized.status === "delivered") {
        stopPolling();
      }
    };

    const handleStorage = () => loadOrder({ silent: true });

    window.addEventListener(ORDER_UPDATED_EVENT, syncOrder);
    window.addEventListener("storage", handleStorage);

    return () => {
      stopPolling();
      window.removeEventListener(ORDER_UPDATED_EVENT, syncOrder);
      window.removeEventListener("storage", handleStorage);
    };
  }, [id, loadOrder, stopPolling]);

  useEffect(() => {
    if ((order?.status || "").toLowerCase() === "delivered") {
      stopPolling();
    }
  }, [order?.status, stopPolling]);

  const displayOrder = useMemo(() => {
    if (order) return order;
    return fallbackOrder;
  }, [order]);
  const resolvedOrderId = displayOrder.orderId || displayOrder.id || id || "demo-order";
  const handleManualRefresh = () => loadOrder({ silent: true });

  if (loading) {
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
                <div className="ml-auto flex items-start gap-2 text-right">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Tracking</p>
                    <p className="mt-1 text-sm font-semibold text-white/90">Live status updates from shop, rider and backend</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="rounded-2xl bg-white/15 p-3 text-white backdrop-blur-sm"
                    aria-label="Refresh order tracking"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
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
            <div className="px-4 py-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-40 rounded-full bg-slate-100" />
                <div className="h-4 w-3/4 rounded-full bg-slate-100" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                  <div className="h-16 rounded-2xl bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-32 rounded-full bg-slate-100" />
              <div className="h-4 w-full rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 rounded-full bg-slate-100" />
              <div className="h-4 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !order && !notFound) {
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
                <div className="ml-auto flex items-start gap-2 text-right">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Tracking</p>
                    <p className="mt-1 text-sm font-semibold text-white/90">Live status updates from shop, rider and backend</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="rounded-2xl bg-white/15 p-3 text-white backdrop-blur-sm"
                    aria-label="Refresh order tracking"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ErrorState
            title="Tracking failed to load"
            description={error}
            action={() => window.location.reload()}
            actionText="Retry"
          />
        </div>
      </div>
    );
  }

  if (notFound) {
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
                <div className="ml-auto flex items-start gap-2 text-right">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Tracking</p>
                    <p className="mt-1 text-sm font-semibold text-white/90">Live status updates from shop, rider and backend</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    className="rounded-2xl bg-white/15 p-3 text-white backdrop-blur-sm"
                    aria-label="Refresh order tracking"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <EmptyState
            title="Order not found"
            description="We could not find this order on the backend or in local storage."
            action={() => navigate("/cart")}
            actionText="Go to Cart"
          />
        </div>
      </div>
    );
  }

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
              <div className="ml-auto flex items-start gap-2 text-right">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/80">Tracking</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">Live status updates from shop, rider and backend</p>
                </div>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="rounded-2xl bg-white/15 p-3 text-white backdrop-blur-sm"
                  aria-label="Refresh order tracking"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
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
