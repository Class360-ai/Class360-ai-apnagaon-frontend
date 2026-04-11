import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { analyticsAPI, authAPI, ordersAPI, productsAPI, safeFetch } from "../utils/api";
import { getLocalOrders, normalizeOrder } from "../utils/orderStorage";
import { getSavedAddresses } from "../utils/locationHelpers";
import { getRewards } from "../utils/rewardWallet";
import { buildAnalyticsSnapshot, ADMIN_ANALYTICS_EMPTY } from "../utils/adminAnalyticsHelpers";
import {
  ADMIN_PRODUCT_KEY,
  DEFAULT_ADMIN_PRODUCTS,
  loadAdminCollection,
  normalizeProduct,
} from "../utils/adminCatalogStorage";
import AnalyticsStatCards from "../components/admin/analytics/AnalyticsStatCards";
import OrdersChart from "../components/admin/analytics/OrdersChart";
import RevenueChart from "../components/admin/analytics/RevenueChart";
import TopProductsCard from "../components/admin/analytics/TopProductsCard";
import CategoryPerformanceCard from "../components/admin/analytics/CategoryPerformanceCard";
import RewardsAnalyticsCard from "../components/admin/analytics/RewardsAnalyticsCard";
import CustomerInsightsCard from "../components/admin/analytics/CustomerInsightsCard";
import DeliveryInsightsCard from "../components/admin/analytics/DeliveryInsightsCard";

const toOrderList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const toProductList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  return [];
};

const mergeOrders = (backendOrders = [], localOrders = []) => {
  const map = new Map();
  [...backendOrders, ...localOrders].forEach((order) => {
    const normalized = normalizeOrder(order);
    const key = normalized.id || normalized._id || normalized.orderId;
    const current = map.get(key);
    if (!current) {
      map.set(key, normalized);
      return;
    }
    const currentTime = new Date(current.updatedAt || current.createdAt || 0).getTime();
    const nextTime = new Date(normalized.updatedAt || normalized.createdAt || 0).getTime();
    if (nextTime >= currentTime) map.set(key, normalized);
  });
  return Array.from(map.values());
};

const mergeProducts = (backendProducts = [], localProducts = []) => {
  const map = new Map();
  [...backendProducts, ...localProducts].forEach((product) => {
    const normalized = normalizeProduct(product);
    const key = normalized.id || normalized._id || normalized.name;
    map.set(key, normalized);
  });
  return Array.from(map.values());
};

const sectionBand = "rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100";

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(ADMIN_ANALYTICS_EMPTY);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("local");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [backendAnalytics, backendOrders, backendProducts, backendUsers] = await Promise.all([
        safeFetch(() => analyticsAPI.getAdmin(), null),
        safeFetch(() => ordersAPI.getAll(), []),
        safeFetch(() => productsAPI.getAll(), []),
        safeFetch(() => authAPI.users(), []),
      ]);

      const orders = mergeOrders(
        toOrderList(backendOrders).map(normalizeOrder),
        getLocalOrders()
      );
      const products = mergeProducts(toProductList(backendProducts), loadAdminCollection(ADMIN_PRODUCT_KEY, DEFAULT_ADMIN_PRODUCTS).map(normalizeProduct));
      const computed = buildAnalyticsSnapshot({
        backend: backendAnalytics || {},
        orders,
        products,
        users: Array.isArray(backendUsers) ? backendUsers : [],
        rewards: getRewards(),
        savedAddresses: getSavedAddresses(),
      });

      setAnalytics(computed);
      setSource(backendAnalytics ? "backend + local fallback" : "local fallback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    const sync = () => load();
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", sync);
    };
  }, [load]);

  const stats = useMemo(
    () => [
      { label: "Total Orders", value: analytics.totalOrders || 0, hint: "All checkout orders", tone: "emerald" },
      { label: "Total Revenue", value: analytics.totalRevenue || 0, kind: "currency", hint: "Gross revenue", tone: "orange" },
      { label: "Today Orders", value: analytics.todayOrders || 0, hint: "Placed today", tone: "blue" },
      { label: "Delivered Orders", value: analytics.deliveredOrders || 0, hint: "Completed deliveries", tone: "slate" },
      { label: "Cancelled Orders", value: analytics.cancelledOrders || 0, hint: "Orders canceled", tone: "red" },
      { label: "Average Order Value", value: analytics.avgOrderValue || 0, kind: "currency", hint: "Revenue / total orders", tone: "emerald" },
    ],
    [analytics]
  );

  const emptyState = !loading && !analytics.totalOrders && !analytics.totalRevenue && !analytics.topSellingProducts.length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <main className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center gap-3 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <BarChart3 className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Admin analytics</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Business dashboard</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Revenue, products, rewards, customers, and delivery health in one view.</p>
          </div>
          <button type="button" onClick={load} className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100" aria-label="Refresh analytics">
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-[24px] bg-white px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-100">
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-black text-emerald-700 ring-1 ring-emerald-100">Source: {source}</span>
          <span>Charts and cards are derived from backend orders, products, users, rewards, and saved addresses.</span>
        </div>

        {loading ? <div className="rounded-[24px] bg-white p-5 text-sm font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">Loading analytics...</div> : null}

        {emptyState ? (
          <div className={sectionBand}>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">No analytics yet</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">The dashboard will light up as soon as orders start coming in.</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              This view stays safe on empty data, so you can still use it during setup and testing without any crashes.
            </p>
          </div>
        ) : null}

        <AnalyticsStatCards stats={stats} />

        <div className="grid gap-4 xl:grid-cols-2">
          <OrdersChart data={analytics.orderSeries} />
          <RevenueChart data={analytics.revenueSeries} />
        </div>

        <TopProductsCard
          topSellingProducts={analytics.topSellingProducts}
          mostAddedToCart={analytics.mostAddedToCart}
          lowPerformingProducts={analytics.lowPerformingProducts}
          outOfStockProducts={analytics.outOfStockProducts}
        />

        <CategoryPerformanceCard categoryPerformance={analytics.categoryPerformance} />

        <div className="grid gap-4 xl:grid-cols-2">
          <RewardsAnalyticsCard rewardStats={analytics.rewardStats} topRewards={analytics.rewardStats?.popularReward ? [analytics.rewardStats.popularReward] : []} />
          <CustomerInsightsCard customerInsights={analytics.customerInsights} customerGrowthSeries={analytics.customerGrowthSeries} />
        </div>

        <DeliveryInsightsCard deliveryInsights={analytics.deliveryInsights} />

        <section className="grid gap-4 xl:grid-cols-2">
          <div className={sectionBand}>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Quick summary</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Orders ready to act on</p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  {(analytics.totalOrders || 0) - (analytics.deliveredOrders || 0) - (analytics.cancelledOrders || 0)}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Saved addresses</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{analytics.customerInsights?.totalSavedAddresses || 0}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Rewards usage</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{analytics.rewardStats?.rewardsUsed || 0}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">On-time deliveries</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{analytics.deliveryInsights?.ordersDeliveredOnTime || 0}</p>
              </div>
            </div>
          </div>

          <div className={sectionBand}>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Useful business notes</p>
            <div className="mt-3 space-y-3 text-sm font-semibold leading-6 text-slate-600">
              <p>
                <span className="font-black text-slate-950">Top product pressure:</span> watch low-performing and out-of-stock products to keep reorder friction low.
              </p>
              <p>
                <span className="font-black text-slate-950">Reward health:</span> coupon usage and reward redemptions show whether offers are actually moving checkout.
              </p>
              <p>
                <span className="font-black text-slate-950">Delivery speed:</span> average ETA and delayed orders help us spot where local logistics need more help.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
