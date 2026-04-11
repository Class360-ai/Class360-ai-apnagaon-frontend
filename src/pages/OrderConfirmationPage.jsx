import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Home, MapPin, PackageCheck, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { formatPrice } from "../utils/helpers";
import { formatAddressLine } from "../utils/locationHelpers";
import { getLocalOrderById, getLocalOrders, ORDER_STATUS_META, ORDER_UPDATED_EVENT } from "../utils/orderStorage";
import { ordersAPI, safeFetch } from "../utils/api";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/checkout/PaymentStatusBadge";
import SupportActions from "../components/SupportActions";

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
  const serviceFee = Number(totals.serviceFee ?? order.serviceFee ?? 0) || 0;
  const discount = Number(totals.discount ?? order.discount ?? 0) || 0;
  const total = Number(totals.total ?? order.total ?? Math.max(0, subtotal + deliveryFee + serviceFee - discount)) || 0;
  return { subtotal, deliveryFee, serviceFee, discount, total };
};

const createFallbackOrder = (id) => ({
  id: id || "demo-order",
  orderId: id || "demo-order",
  status: "placed",
  eta: "30 min",
  etaMinutes: 30,
  paymentMethod: "Cash on Delivery",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [],
  address: {
    fullName: "ApnaGaon Customer",
    label: "Home",
    phone: "",
    house: "",
    area: "Azampur",
    city: "Azamgarh",
    state: "Uttar Pradesh",
    pincode: "276125",
    note: "",
  },
  totals: {
    subtotal: 0,
    deliveryFee: 0,
    serviceFee: 0,
    discount: 0,
    total: 0,
  },
});

const TimelinePreview = ({ status = "placed" }) => {
  const currentIndex = status === "cancelled" ? -1 : STATUS_INDEX[status] ?? 0;

  return (
    <div className="rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Live status</p>
          <p className="mt-1 text-sm font-black text-slate-950">{ORDER_STATUS_META[status]?.note || "Order in progress"}</p>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const active = index <= currentIndex;
          const completed = index < currentIndex;

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
                <p className="text-xs font-semibold text-slate-500">{active ? "Updated from the shop flow" : "Pending"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderItemsMiniCard = ({ items = [], totals = {} }) => {
  const visibleItems = items.slice(0, 4);

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Items Summary</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">What’s in this order</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <div key={item.id || item.name} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">{item.name || "Item"}</p>
                <p className="text-xs font-semibold text-slate-500">Qty {item.quantity || 1}</p>
              </div>
              <p className="text-sm font-black text-slate-950">{formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">We’re loading your items, please check the tracking page if the list takes a second to appear.</div>
        )}
      </div>

      <div className="mt-4 grid gap-2 rounded-[24px] bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
        <div className="flex items-center justify-between gap-3">
          <span>Subtotal</span>
          <span>{formatPrice(totals.subtotal || 0)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Delivery fee</span>
          <span>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : "Free"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Discount / reward</span>
          <span>- {formatPrice(totals.discount || 0)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 border-t border-emerald-200 pt-3 text-base font-black">
          <span>Total paid</span>
          <span>{formatPrice(totals.total || 0)}</span>
        </div>
      </div>
    </section>
  );
};

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      const localOrder = id ? getLocalOrderById(id) : getLocalOrders()[0] || null;
      const remoteOrder = id ? await safeFetch(() => ordersAPI.getById(id), null) : null;
      if (!mounted) return;
      setOrder(remoteOrder || localOrder || createFallbackOrder(id));
    };

    loadOrder();

    const refresh = () => loadOrder();
    const syncOrder = (event) => {
      const nextOrder = event.detail;
      if (!nextOrder) return;
      if (id && nextOrder.id !== id && nextOrder._id !== id && nextOrder.orderId !== id) return;
      setOrder(nextOrder);
    };

    const timer = window.setInterval(loadOrder, 12000);
    window.addEventListener(ORDER_UPDATED_EVENT, syncOrder);
    window.addEventListener("storage", refresh);

    return () => {
      mounted = false;
      window.clearInterval(timer);
      window.removeEventListener(ORDER_UPDATED_EVENT, syncOrder);
      window.removeEventListener("storage", refresh);
    };
  }, [id]);

  const displayOrder = useMemo(() => order || createFallbackOrder(id), [id, order]);
  const totals = useMemo(() => safeTotals(displayOrder), [displayOrder]);
  const orderId = displayOrder.orderId || displayOrder.id || id || "demo-order";
  const status = displayOrder.status || "placed";
  const etaLabel = displayOrder.eta || `${displayOrder.etaMinutes || 30} min`;
  const paymentLabel = displayOrder.paymentMethod || displayOrder.payment?.provider || "Cash on Delivery";
  const addressLine = formatAddressLine(displayOrder.address || {});
  const supportMessage = `Hello ApnaGaon / Namaste ApnaGaon,\nI need help with my order.\n\nOrder ID: ${orderId}\nStatus: ${ORDER_STATUS_META[status]?.label || "Placed"}\nPayment: ${paymentLabel}\nTotal: ${formatPrice(totals.total)}\n\nPlease assist.`;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-1 shadow-xl shadow-emerald-100">
          <div className="rounded-[29px] bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">Success</p>
                <p className="mt-1 text-xs font-bold text-slate-500">Tracking is already linked to this order</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Order Confirmed</p>
              <h1 className="mt-1 text-3xl font-black leading-tight text-slate-950">Your order has been placed successfully</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                The shop has received your order and the tracking flow is ready. We’ll keep the next steps visible here and on the tracking page.
              </p>
            </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={status} />
            <PaymentStatusBadge status={displayOrder.paymentStatus || displayOrder.payment?.status || "pending"} />
            <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-orange-700 ring-1 ring-orange-100">
              ETA {etaLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
              100% Secure
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <PackageCheck className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Order Details</p>
              <h2 className="mt-1 truncate text-lg font-black text-slate-950">#{orderId}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{formatOrderDate(displayOrder.createdAt)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Payment
            </span>
            <span className="text-right font-black text-slate-950">{paymentLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Payment status</span>
            <PaymentStatusBadge status={displayOrder.paymentStatus || displayOrder.payment?.status || "pending"} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Total</span>
            <span className="font-black text-slate-950">{formatPrice(totals.total)}</span>
          </div>
            {displayOrder.couponCode || displayOrder.couponUsed ? (
              <div className="flex items-center justify-between gap-3 text-emerald-700">
                <span>Coupon</span>
                <span className="font-black">{displayOrder.couponCode || displayOrder.couponUsed}</span>
              </div>
            ) : null}
            {totals.discount ? (
              <div className="flex items-center justify-between gap-3 text-emerald-700">
                <span>You saved</span>
                <span className="font-black">{formatPrice(totals.discount)}</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery Address</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Where the order is going</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">Saved</span>
          </div>

          <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-slate-100">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  {displayOrder.address?.fullName || displayOrder.customerName || "ApnaGaon Customer"}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {displayOrder.address?.label || "Home"}
                  {displayOrder.address?.phone ? ` · ${displayOrder.address.phone}` : ""}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{addressLine || "Delivery address will be shown here."}</p>
                {displayOrder.address?.note ? <p className="mt-2 text-xs font-bold text-orange-700">Note: {displayOrder.address.note}</p> : null}
              </div>
            </div>
          </div>
        </section>

        <OrderItemsMiniCard items={Array.isArray(displayOrder.items) ? displayOrder.items : []} totals={totals} />

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Tracking</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Live order movement</h2>
            </div>
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <div className="mt-4">
            <TimelinePreview status={status} />
          </div>
        </section>

        <section className="rounded-[28px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-emerald-950">Need help with your order?</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
                WhatsApp support is ready with this order ID, payment, and delivery details if you need a quick human handoff.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <SupportActions message={supportMessage} compact />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/track-order/${orderId}`)}
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100"
          >
            Track Order
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100"
          >
            <Home className="h-4 w-4 text-orange-600" />
            Back to Home
          </button>
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 shadow-sm ring-1 ring-slate-100"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            View Cart
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 rounded-full bg-orange-50 px-4 py-4 text-sm font-black text-orange-700 ring-1 ring-orange-100"
          >
            <ArrowRight className="h-4 w-4" />
            Continue Shopping
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmationPage;
