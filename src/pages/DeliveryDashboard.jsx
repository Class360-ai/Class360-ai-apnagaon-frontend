import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Phone, RefreshCw, Truck, UserCircle2 } from "lucide-react";
import DeliveryLayout from "../components/DeliveryLayout";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { useAuth } from "../context/useAuth";
import { formatPrice } from "../utils/helpers";
import { formatAddressLine } from "../utils/locationHelpers";
import { ordersAPI, safeFetch } from "../utils/api";
import { ORDER_UPDATED_EVENT, getLocalOrders, updateLocalOrderStatus, ORDER_STATUS_META } from "../utils/orderStorage";

const callPhone = (phone) => {
  if (!phone) return false;
  window.location.href = `tel:${String(phone).replace(/\D/g, "")}`;
  return true;
};

const DeliveryDashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await safeFetch(() => ordersAPI.getAll(), []);
    const list = Array.isArray(data) ? data : data?.orders || [];
    setOrders(Array.isArray(list) ? list : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    const pollTimer = window.setInterval(load, 12000);
    const sync = () => setOrders(getLocalOrders());
    window.addEventListener(ORDER_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(pollTimer);
      window.removeEventListener(ORDER_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [load]);

  const activeOrders = useMemo(
    () =>
      orders.filter((order) => {
        const assignedToMe =
          String(order.deliveryPartnerId || order.riderId || "") === String(auth.user?.id || auth.user?._id || "") ||
          String(order.riderPhone || "") === String(auth.user?.phone || "").trim();
        return assignedToMe && !["delivered", "cancelled", "failed_delivery"].includes(order.status);
      }),
    [auth.user, orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter((order) => {
        const assignedToMe =
          String(order.deliveryPartnerId || order.riderId || "") === String(auth.user?.id || auth.user?._id || "") ||
          String(order.riderPhone || "") === String(auth.user?.phone || "").trim();
        return assignedToMe && order.status === "delivered";
      }),
    [auth.user, orders]
  );

  const currentOrder = activeOrders[0] || completedOrders[0] || null;
  const canCallCustomer = Boolean(currentOrder?.phone || currentOrder?.customer?.phone);
  const canCallShop = Boolean(currentOrder?.shopPhone || currentOrder?.storePhone);

  const updateOrder = async (order, status) => {
    const id = order._id || order.id || order.orderId;
    await safeFetch(() => ordersAPI.updateStatus(id, status), null);
    updateLocalOrderStatus(id, status, ORDER_STATUS_META[status]?.note || status);
    load();
  };

  const section = location.pathname.includes("/profile")
    ? "profile"
    : location.pathname.includes("/orders")
      ? "orders"
      : "dashboard";

  return (
    <DeliveryLayout>
      <div className="space-y-4">
        {section === "profile" ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                <UserCircle2 className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">Delivery profile</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{auth.user?.name || "Delivery Partner"}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">{auth.user?.phone || "Phone not available"}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Role</p>
                <p className="mt-1 text-lg font-black text-slate-950">{auth.user?.displayRole || "Delivery Partner"}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Completed</p>
                <p className="mt-1 text-lg font-black text-slate-950">{completedOrders.length}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => navigate("/delivery/dashboard")} className="rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100">
                Back to dashboard
              </button>
              <button type="button" onClick={() => navigate("/login")} className="rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 ring-1 ring-slate-100">
                Switch account
              </button>
            </div>
          </section>
        ) : null}

        {section === "dashboard" ? (
          <>
            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Assigned</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{activeOrders.length}</p>
              </div>
              <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Completed</p>
                <p className="mt-1 text-3xl font-black text-slate-950">{completedOrders.length}</p>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Current order</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">{currentOrder ? `#${currentOrder.orderId || currentOrder.id}` : "No active order"}</h2>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-orange-700 ring-1 ring-orange-100">
                  Live
                </span>
              </div>
              {currentOrder ? (
                <>
                  <div className="mt-4 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-sm font-black text-slate-950">{currentOrder.customerName || currentOrder.customer?.name || "Customer"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{formatAddressLine(currentOrder.address)}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">Pickup: {currentOrder.shopAddress || currentOrder.shopName || "Shop address not set"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Total: {formatPrice(currentOrder.total || currentOrder.totals?.total || 0)}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => callPhone(currentOrder.phone || currentOrder.customer?.phone)} disabled={!canCallCustomer} className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
                      <Phone className="mr-2 inline h-4 w-4 text-orange-600" />
                      Call customer
                    </button>
                    <button type="button" onClick={() => callPhone(currentOrder.shopPhone || currentOrder.storePhone)} disabled={!canCallShop} className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
                      <Phone className="mr-2 inline h-4 w-4 text-emerald-600" />
                      Call shop
                    </button>
                    <button type="button" onClick={() => updateOrder(currentOrder, "picked_up")} className="rounded-full bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 ring-1 ring-orange-100">
                      Picked up
                    </button>
                    <button type="button" onClick={() => updateOrder(currentOrder, "on_the_way")} className="rounded-full bg-sky-50 px-4 py-3 text-sm font-black text-sky-700 ring-1 ring-sky-100">
                      On the way
                    </button>
                    <button type="button" onClick={() => updateOrder(currentOrder, "delivered")} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white">
                      Delivered
                    </button>
                    <button type="button" onClick={() => navigate(`/delivery/order/${currentOrder.orderId || currentOrder.id || currentOrder._id}`)} className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-900 ring-1 ring-slate-100">
                      Open order
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                  No active delivery right now. Assigned orders will appear here once they are handed over.
                </div>
              )}
            </section>
          </>
        ) : null}

        {section === "orders" ? (
          <section className="space-y-3">
            <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Assigned orders</p>
                  <h2 className="mt-1 text-lg font-black text-slate-950">Delivery queue</h2>
                </div>
                <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loading ? <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading assigned deliveries...</div> : null}

            {!loading && !activeOrders.length ? (
              <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">No assigned orders yet.</div>
            ) : null}

            <div className="grid gap-3">
              {activeOrders.map((order) => (
                <article key={order._id || order.id || order.orderId} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-950">#{order.orderId || order.id || order._id}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerName || order.customer?.name || "Customer"}</p>
                    </div>
                    <OrderStatusBadge status={order.status || "placed"} />
                  </div>
                  <div className="mt-3 rounded-[24px] bg-slate-50 p-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
                    <p>Pickup: {order.shopAddress || order.shopName || "Shop pickup address will appear here"}</p>
                    <p className="mt-1">Customer: {formatAddressLine(order.address)}</p>
                    <p className="mt-1">Payment: {order.paymentMethod || "Pending"}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button type="button" onClick={() => callPhone(order.phone || order.customer?.phone)} className="rounded-full bg-white px-3 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      <Phone className="mx-auto h-4 w-4" />
                      Call
                    </button>
                    <button type="button" onClick={() => updateOrder(order, "picked_up")} className="rounded-full bg-orange-50 px-3 py-3 text-xs font-black text-orange-700 ring-1 ring-orange-100">
                      Picked up
                    </button>
                    <button type="button" onClick={() => navigate(`/delivery/order/${order.orderId || order.id || order._id}`)} className="rounded-full bg-white px-3 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      Open
                    </button>
                    <button type="button" onClick={() => updateOrder(order, "delivered")} className="rounded-full bg-emerald-600 px-3 py-3 text-xs font-black text-white">
                      Delivered
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryDashboard;
