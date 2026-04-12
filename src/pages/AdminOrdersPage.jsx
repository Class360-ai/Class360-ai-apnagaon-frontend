import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminStatsCards from "../components/admin/AdminStatsCards";
import OrderFilters from "../components/admin/OrderFilters";
import OrderRow from "../components/admin/OrderRow";
import OrderDetailModal from "../components/admin/OrderDetailModal";
import { ordersAPI, safeFetch } from "../utils/api";
import { formatAddressLine } from "../utils/locationHelpers";
import {
  getLocalOrders,
  ORDER_STATUSES,
  ORDER_STATUS_META,
  ORDER_UPDATED_EVENT,
  normalizeOrder,
  updateLocalOrderStatus,
} from "../utils/orderStorage";
import { callCustomer, getOrderCustomerName, getOrderPhone, openCustomerWhatsApp } from "../utils/adminOrderHelpers";

const toOrderArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const mergeOrders = (primary = [], secondary = []) => {
  const map = new Map();
  [...secondary, ...primary].forEach((order) => {
    const normalized = normalizeOrder(order);
    const key = normalized.id || normalized._id || normalized.orderId;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, normalized);
      return;
    }
    const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
    const nextTime = new Date(normalized.updatedAt || normalized.createdAt || 0).getTime();
    map.set(key, nextTime >= existingTime ? normalized : existing);
  });
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const getTodayKey = () => new Date().toDateString();

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let backendOrders = null;
      try {
        backendOrders = toOrderArray(await ordersAPI.getAll());
      } catch (fetchError) {
        console.warn("[ApnaGaon] Failed to load backend orders:", fetchError);
        setError(fetchError?.message || "Unable to load backend orders");
      }
      const localOrders = getLocalOrders();
      const merged = mergeOrders(backendOrders || [], localOrders);
      setOrders(merged.length ? merged : localOrders);
      if (!merged.length && !localOrders.length && !backendOrders?.length) {
        setError((current) => current || "No orders available yet.");
      }
      if (backendOrders?.length) setError("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(loadOrders, 0);
    const sync = () => setOrders(mergeOrders([], getLocalOrders()));
    window.addEventListener(ORDER_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener(ORDER_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [loadOrders]);

  const metrics = useMemo(() => {
    const todayKey = getTodayKey();
    const todayOrders = orders.filter((order) => new Date(order.createdAt || 0).toDateString() === todayKey);
    const pendingOrders = orders.filter((order) => ["placed", "confirmed", "preparing"].includes(order.status));
    const deliveredOrders = orders.filter((order) => order.status === "delivered");
    const revenue = orders.reduce((sum, order) => sum + (Number(order.totals?.total) || 0), 0);
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      pendingOrders: pendingOrders.length,
      deliveredOrders: deliveredOrders.length,
      revenue,
    };
  }, [orders]);

  const counts = useMemo(() => {
    const next = { all: orders.length };
    ORDER_STATUSES.forEach((status) => {
      next[status] = orders.filter((order) => order.status === status).length;
    });
    return next;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = filter === "all" ? true : order.status === filter;
      const searchable = [
        order.orderId,
        order.id,
        getOrderCustomerName(order),
        getOrderPhone(order),
        formatAddressLine(order.address || {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [filter, orders, search]);

  const selectedOrder = useMemo(
    () => orders.find((order) => (order.id || order._id || order.orderId) === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const updateStatus = async (order, status) => {
    const orderId = order._id || order.id || order.orderId;
    const note = ORDER_STATUS_META[status]?.note || `Order updated to ${status}`;
    const optimistic = normalizeOrder({
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      trackingSteps: [
        ...(Array.isArray(order.trackingSteps) ? order.trackingSteps : []),
        { status, time: new Date().toISOString(), note },
      ],
    });

    setOrders((current) =>
      mergeOrders(
        current.map((item) => ((item.id || item._id || item.orderId) === orderId ? optimistic : item)),
        []
      )
    );
    if (selectedOrderId === orderId) setSelectedOrderId(orderId);

    const backendOrder = await safeFetch(() => ordersAPI.updateStatus(orderId, status), null);
    if (backendOrder) {
      const normalized = normalizeOrder(backendOrder);
      setOrders((current) =>
        mergeOrders(
          current.map((item) => ((item.id || item._id || item.orderId) === orderId ? normalized : item)),
          []
        )
      );
      return;
    }

    const localUpdated = updateLocalOrderStatus(orderId, status, note);
    if (localUpdated) {
      setOrders((current) =>
        mergeOrders(
          current.map((item) => ((item.id || item._id || item.orderId) === orderId ? localUpdated : item)),
          []
        )
      );
    }
  };

  const handleWhatsApp = (order) => {
    openCustomerWhatsApp(order, ORDER_STATUS_META[order.status]?.label || "placed");
  };

  const handleCall = (order) => {
    callCustomer(order);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center gap-3 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Admin dashboard</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Orders</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">View, filter, and update real checkout orders from one place.</p>
          </div>
          <button type="button" onClick={loadOrders} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100" aria-label="Refresh orders">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        <AdminStatsCards metrics={metrics} />

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Filters</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Find orders quickly</h2>
            </div>
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, phone, order ID"
                className="w-full rounded-full bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="mt-4">
            <OrderFilters filter={filter} setFilter={setFilter} counts={counts} />
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading orders...</div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-rose-600 shadow-sm ring-1 ring-rose-100">
            {error}
          </div>
        ) : null}

        {!loading && !visibleOrders.length ? (
          <div className="rounded-[28px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
            No orders found yet. Checkout orders will appear here once customers place them.
          </div>
        ) : null}

        <section className="grid gap-3 xl:grid-cols-2">
          {visibleOrders.map((order) => (
            <OrderRow
              key={order.id || order._id || order.orderId}
              order={order}
              onOpen={() => setSelectedOrderId(order.id || order._id || order.orderId)}
              onStatusChange={(status) => updateStatus(order, status)}
              onWhatsApp={() => handleWhatsApp(order)}
              onCall={() => handleCall(order)}
            />
          ))}
        </section>
      </main>

      {selectedOrder ? (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={(status) => updateStatus(selectedOrder, status)}
          onWhatsApp={() => handleWhatsApp(selectedOrder)}
          onCall={() => handleCall(selectedOrder)}
        />
      ) : null}
    </div>
  );
};

export default AdminOrdersPage;
