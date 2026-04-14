import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Home, MessageCircle, Package2, ShieldCheck } from "lucide-react";
import { formatPrice } from "../utils/helpers";
import { formatAddressLine } from "../utils/locationHelpers";
import { buildCheckoutWhatsAppMessage, buildWhatsAppCheckoutLink } from "../utils/whatsappMessage";
import { ORDER_UPDATED_EVENT, ORDER_STATUS_META } from "../utils/orderStorage";
import { getOrderById } from "../services/orderService";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/checkout/PaymentStatusBadge";

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

const safeTotals = (order = {}) => {
  const totals = order.totals || {};
  const subtotal = Number(totals.subtotal ?? order.subtotal ?? 0) || 0;
  const deliveryFee = Number(totals.deliveryFee ?? order.deliveryFee ?? 0) || 0;
  const packagingFee = Number(totals.packagingFee ?? order.packagingFee ?? 0) || 0;
  const discount = Number(totals.discount ?? order.discount ?? 0) || 0;
  const total = Number(totals.total ?? order.total ?? Math.max(0, subtotal + deliveryFee + packagingFee - discount)) || 0;
  return { subtotal, deliveryFee, packagingFee, discount, total };
};

const formatItemsLabel = (items = []) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return "No items available";
  return list
    .slice(0, 3)
    .map((item) => `${item.name || "Item"} x${Number(item.quantity || 1) || 1}`)
    .join(", ") + (list.length > 3 ? ` +${list.length - 3} more` : "");
};

const OrderSuccessPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        setNotFound(false);
        const resolvedOrderId = String(id || location.state?.orderId || location.state?.order?.orderId || location.state?.order?.id || "").trim();
        if (!resolvedOrderId) {
          setOrder(null);
          setNotFound(true);
          return;
        }

        const stateOrder = location.state?.order ? location.state.order : null;
        let resolvedOrder = stateOrder && (stateOrder.orderId === resolvedOrderId || stateOrder.id === resolvedOrderId) ? stateOrder : null;

        if (!resolvedOrder) {
          resolvedOrder = await getOrderById(resolvedOrderId);
        }

        if (!resolvedOrder) {
          setOrder(null);
          setNotFound(true);
          return;
        }

        setOrder(resolvedOrder);
      } catch {
        setOrder(null);
        setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();

    const sync = (event) => {
      const next = event.detail;
      if (!next) return;
      const nextId = next.orderId || next.id || next._id;
      if (id && nextId !== id) return;
      setOrder(next);
    };

    const refresh = () => loadOrder();
    window.addEventListener(ORDER_UPDATED_EVENT, sync);
    window.addEventListener("storage", refresh);

    return () => {
      mounted = false;
      window.removeEventListener(ORDER_UPDATED_EVENT, sync);
      window.removeEventListener("storage", refresh);
    };
  }, [id, location.state?.order]);

  const displayOrder = useMemo(() => order || location.state?.order || null, [location.state?.order, order]);
  const orderId = displayOrder?.orderId || displayOrder?.id || id || "";
  const totals = useMemo(() => safeTotals(displayOrder), [displayOrder]);
  const status = displayOrder?.status || "placed";
  const isWhatsappOrder = status === "whatsapp_pending" || String(displayOrder?.source || "").toLowerCase() === "whatsapp";
  const paymentLabel = displayOrder?.paymentMethod || displayOrder?.payment?.provider || "Cash on Delivery";
  const addressLine = formatAddressLine(displayOrder?.address || {});
  const itemList = Array.isArray(displayOrder?.items) ? displayOrder.items : [];
  const whatsappMessage = buildCheckoutWhatsAppMessage({
    orderId,
    customer: {
      name: displayOrder?.customerName || displayOrder?.address?.fullName || "ApnaGaon Customer",
      phone: displayOrder?.phone || displayOrder?.address?.phone || "",
      address: addressLine || displayOrder?.address?.address || "",
      landmark: displayOrder?.address?.landmark || displayOrder?.landmark || "",
      notes: displayOrder?.notes || displayOrder?.address?.note || "",
    },
    items: itemList,
    totals,
    paymentMethod: paymentLabel,
  });
  const whatsappLink = buildWhatsAppCheckoutLink(whatsappMessage);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-4">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-24 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100" />
          <div className="h-40 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100" />
          <div className="h-64 animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100" />
        </div>
      </div>
    );
  }

  if (notFound && !displayOrder) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-4">
        <main className="mx-auto max-w-md space-y-4">
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100"
                aria-label="Go back"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Order Success</p>
                <h1 className="text-lg font-black text-slate-950">Order not found</h1>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
              We could not find this order yet. It may still be syncing, or the order ID may be incorrect.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="rounded-full bg-orange-500 px-4 py-3 text-sm font-black text-white"
              >
                Back to Cart
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-200"
              >
                Back to Home
              </button>
            </div>
            {orderId ? (
              <div className="mt-3 rounded-[18px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">
                Order ID: <span className="font-black text-slate-800">{orderId}</span>
              </div>
            ) : null}
          </section>
        </main>
      </div>
    );
  }

  const itemPreview = itemList.slice(0, 3);
  const whatsappAvailable = isWhatsappOrder && Boolean(whatsappLink && whatsappLink !== "javascript:void(0)");

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-md space-y-4">
        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Order placed</p>
                <h1 className="truncate text-lg font-black text-slate-950">Success</h1>
              </div>
            </div>
            <OrderStatusBadge status={status} />
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">
            Your order is in the system and ready for the next step. Keep this page handy for tracking and support.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[18px] bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Order ID</p>
              <p className="mt-1 truncate text-sm font-black text-slate-950">#{orderId || "Pending"}</p>
            </div>
            <div className="rounded-[18px] bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Placed on</p>
              <p className="mt-1 text-sm font-black text-slate-950">{formatOrderDate(displayOrder?.createdAt)}</p>
            </div>
            <div className="rounded-[18px] bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Payment</p>
              <p className="mt-1 text-sm font-black text-slate-950">{paymentLabel}</p>
            </div>
            <div className="rounded-[18px] bg-slate-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Status</p>
              <p className="mt-1 text-sm font-black text-slate-950">{ORDER_STATUS_META[status]?.label || "Placed"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Package2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Order summary</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">What you ordered</h2>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {itemPreview.length ? (
              itemPreview.map((item) => (
                <div key={item.id || item.name} className="flex items-center justify-between gap-3 rounded-[18px] bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{item.name || "Item"}</p>
                    <p className="text-xs font-semibold text-slate-500">Qty {Number(item.quantity || 1) || 1}</p>
                  </div>
                  <p className="text-sm font-black text-slate-950">{formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] bg-slate-50 p-3 text-sm font-semibold text-slate-500">Items will appear here once the order syncs.</div>
            )}
          </div>

          <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600">Address</span>
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
                Saved
              </span>
            </div>
            <p className="mt-2 text-sm font-black text-slate-950">{displayOrder?.address?.fullName || displayOrder?.customerName || "ApnaGaon Customer"}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
              {addressLine || displayOrder?.address?.address || "Delivery address will show here."}
            </p>
            {displayOrder?.address?.landmark ? <p className="mt-2 text-xs font-bold text-orange-700">Landmark: {displayOrder.address.landmark}</p> : null}
          </div>

          <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
              <span>Subtotal</span>
              <span className="font-black text-slate-950">{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
              <span>Delivery fee</span>
              <span className="font-black text-emerald-700">{totals.deliveryFee > 0 ? formatPrice(totals.deliveryFee) : "FREE"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
              <span>Packaging</span>
              <span className="font-black text-emerald-700">{totals.packagingFee > 0 ? formatPrice(totals.packagingFee) : "FREE"}</span>
            </div>
            {totals.discount > 0 ? (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
                <span>You saved</span>
                <span className="font-black text-emerald-700">- {formatPrice(totals.discount)}</span>
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <span className="text-base font-black text-slate-700">Total amount</span>
              <span className="text-lg font-black text-slate-950">{formatPrice(totals.total)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-emerald-950">Ready for the next step</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
                Track your order anytime, or continue on WhatsApp if this order was started in chat.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => navigate(`/track-order/${orderId}`)}
              className="flex items-center justify-center gap-2 rounded-[16px] bg-slate-950 px-4 py-3.5 text-sm font-black text-white"
            >
              Track Order
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-3.5 text-sm font-black text-slate-800 ring-1 ring-slate-200"
            >
              <Home className="h-4 w-4 text-orange-600" />
              Back to Home
            </button>
            {whatsappAvailable ? (
              <button
                type="button"
                onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}
                className="flex items-center justify-center gap-2 rounded-[16px] bg-emerald-600 px-4 py-3.5 text-sm font-black text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Continue on WhatsApp
              </button>
            ) : null}
          </div>

          {itemList.length ? (
            <div className="mt-4 rounded-[18px] bg-white px-4 py-3 text-xs font-semibold text-slate-600 ring-1 ring-emerald-100">
              {formatItemsLabel(itemList)}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default OrderSuccessPage;
