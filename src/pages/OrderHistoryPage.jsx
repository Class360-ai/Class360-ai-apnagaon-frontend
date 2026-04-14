import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock3, RefreshCw, ShoppingCart } from "lucide-react";
import EmptyState from "../components/EmptyState";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/CartContext";
import { ordersAPI, productsAPI, safeFetch } from "../utils/api";
import { formatPrice } from "../utils/helpers";
import { getLocalOrders } from "../utils/orderStorage";
import { formatAddressLine } from "../utils/locationHelpers";

const normalizeText = (value = "") => String(value || "").trim().toLowerCase();
const mergeOrders = (...lists) => {
  const seen = new Set();
  return lists.flat().filter((order) => {
    const key = String(order?.orderId || order?.id || order?._id || order?.createdAt || order?.updatedAt || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getOrderTotal = (order = {}) => Number(order.total ?? order.totals?.total ?? 0) || 0;

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      if (auth.isLoggedIn) {
        const result = await safeFetch(() => ordersAPI.getMine(), null);
        const backendOrders = Array.isArray(result) ? result : [];
        setOrders(mergeOrders(backendOrders, auth.user?.orders || [], getLocalOrders()));
      } else {
        setOrders(getLocalOrders());
      }
      setLoading(false);
    };

    loadOrders();
    const sync = () => loadOrders();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [auth.isLoggedIn, auth.user]);

  const sortedOrders = useMemo(
    () =>
      [...(Array.isArray(orders) ? orders : [])].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [orders]
  );

  const reorderOrder = async (order) => {
    const catalog = await safeFetch(() => productsAPI.getAll(), []);
    const catalogItems = Array.isArray(catalog) ? catalog : catalog?.products || [];
    const byId = new Map();
    const byName = new Map();

    catalogItems.forEach((item) => {
      const id = String(item.id || item._id || "");
      if (id) byId.set(id, item);
      byName.set(normalizeText(item.name), item);
    });

    const items = Array.isArray(order.items) ? order.items : [];
    const skipped = [];
    let added = 0;

    items.forEach((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const current =
        byId.get(String(item.productId || item.id || item._id || "")) ||
        byName.get(normalizeText(item.name)) ||
        item;
      const unavailable = current?.available === false || Number(current?.stock) === 0;
      if (unavailable) {
        skipped.push(current?.name || item.name || "Item");
        return;
      }

      const cartItem = {
        ...current,
        id: current.id || current._id || item.id || item.productId || item.name,
        name: current.name || item.name || "Item",
        price: Number(current.price ?? item.price ?? 0) || 0,
        unit: current.unit || item.unit || "",
        image: current.image || item.image || "",
      };

      for (let index = 0; index < quantity; index += 1) {
        addToCart(cartItem);
      }
      added += quantity;
    });

    const notice = skipped.length
      ? `Items added to cart. Skipped unavailable: ${skipped.slice(0, 2).join(", ")}`
      : "Items added to cart";

    setMessage(notice);
    navigate("/cart", { state: { flashMessage: notice, reorderCount: added } });
  };

  const openOrder = (order) => {
    const id = order.orderId || order.id || order._id;
    if (id) navigate(`/track-order/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-4">
      <main className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate("/profile")} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">My Orders</p>
            <h1 className="truncate text-2xl font-black text-slate-950">Order History</h1>
          </div>
        </div>

        {message ? (
          <div className="rounded-[22px] bg-emerald-50 p-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">{message}</div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description={auth.isLoggedIn ? "Your deliveries will appear here once you place an order." : "Sign in to see your order history, reorder, and track updates."}
            action={() => navigate("/")}
            actionText="Start shopping"
            icon={ShoppingCart}
          />
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Orders</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{sortedOrders.length}</p>
              </div>
              <div className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Latest total</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{formatPrice(getOrderTotal(sortedOrders[0]))}</p>
              </div>
            </div>

            {sortedOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const total = getOrderTotal(order);
              const orderId = order.orderId || order.id || order._id;
              return (
                <article key={orderId} className="overflow-hidden rounded-[26px] bg-white shadow-sm ring-1 ring-slate-100">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 via-orange-400 to-amber-400" />
                  <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black text-slate-950">#{orderId}</p>
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Today"}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{items.slice(0, 3).map((item) => item.name).filter(Boolean).join(", ") || "Order items"}</p>
                      {order.address ? (
                        <p className="mt-2 text-xs font-semibold text-slate-500">{typeof order.address === "string" ? order.address : formatAddressLine(order.address)}</p>
                      ) : null}
                    </div>
                    <OrderStatusBadge status={order.status || "placed"} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Total</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{formatPrice(total)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Payment</p>
                      <p className="mt-1 text-sm font-black text-slate-950 truncate">{order.paymentMethod || "Pending"}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openOrder(order)}
                      className="rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                    >
                      Track order
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderOrder(order)}
                      className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:shadow-xl hover:shadow-orange-100 active:scale-[0.99]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reorder
                    </button>
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderHistoryPage;
