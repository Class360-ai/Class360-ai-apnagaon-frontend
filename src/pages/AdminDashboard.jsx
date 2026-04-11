import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Package, ShoppingBag, Store, Users } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { analyticsAPI, ordersAPI, safeFetch } from "../utils/api";
import { formatPrice } from "../utils/helpers";
import { getLocalOrders } from "../utils/orderStorage";
import { buildAnalyticsSnapshot, ADMIN_ANALYTICS_EMPTY } from "../utils/adminAnalyticsHelpers";
import { normalizeProduct, loadAdminCollection, DEFAULT_ADMIN_PRODUCTS, ADMIN_PRODUCT_KEY } from "../utils/adminCatalogStorage";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(ADMIN_ANALYTICS_EMPTY);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [backendAnalytics, backendOrders] = await Promise.all([
        safeFetch(() => analyticsAPI.getAdmin(), null),
        safeFetch(() => ordersAPI.getAll(), []),
      ]);
      if (!mounted) return;
      const orders = Array.isArray(backendOrders) ? backendOrders : backendOrders?.orders || [];
      const products = loadAdminCollection(ADMIN_PRODUCT_KEY, DEFAULT_ADMIN_PRODUCTS).map(normalizeProduct);
      const snapshot = buildAnalyticsSnapshot({
        backend: backendAnalytics || {},
        orders: [...orders, ...getLocalOrders()],
        products,
      });
      setAnalytics(snapshot);
      setRecentOrders([...orders, ...getLocalOrders()].slice(0, 5));
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: "Orders", value: analytics.totalOrders || 0, tone: "emerald", icon: <ShoppingBag className="h-5 w-5" /> },
      { label: "Revenue", value: formatPrice(analytics.totalRevenue || 0), tone: "orange", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "Shops", value: analytics.activeShops || 0, tone: "blue", icon: <Store className="h-5 w-5" /> },
      { label: "Users", value: analytics.customerInsights?.totalCustomers || 0, tone: "slate", icon: <Users className="h-5 w-5" /> },
    ],
    [analytics]
  );

  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{card.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{card.value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${toneClass[card.tone]}`}>{card.icon}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Quick access</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Open a management area</h2>
            </div>
              <button type="button" onClick={() => navigate("/admin/analytics")} className="rounded-full bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
              View analytics
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Orders", "/admin/orders"],
              ["Delivery", "/admin/delivery"],
              ["Shops", "/admin/shops"],
              ["Applications", "/admin/shops/applications"],
              ["Products", "/admin/products"],
              ["Categories", "/admin/categories"],
              ["Offers", "/admin/offers"],
              ["Users", "/admin/users"],
              ["Analytics", "/admin/analytics"],
              ["Launch checklist", "/admin/launch-checklist"],
            ].map(([label, path]) => (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className="flex items-center justify-between rounded-[22px] bg-slate-50 px-4 py-4 text-left text-sm font-black text-slate-700 ring-1 ring-slate-100"
              >
                {label}
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Recent orders</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Latest checkout activity</h2>
            </div>
            <button type="button" onClick={() => navigate("/admin/orders")} className="rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-100">
              Open order board
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order.id || order._id || order.orderId} className="flex items-start justify-between gap-3 rounded-[22px] bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">#{order.orderId || order.id || order._id || "order"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{order.customerName || order.customer?.name || "Customer"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <OrderStatusBadge status={order.status || "placed"} />
                    <p className="text-xs font-semibold text-slate-500">{formatPrice(order.total || order.totals?.total || 0)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No recent orders yet.</div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
