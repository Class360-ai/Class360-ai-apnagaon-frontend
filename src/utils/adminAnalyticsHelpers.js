import { getLocalOrders, normalizeOrder } from "./orderStorage";
import { getSavedAddresses } from "./locationHelpers";
import { getRewards } from "./rewardWallet";

const toNumber = (value) => Number(value) || 0;
const toKey = (value) => String(value || "").trim().toLowerCase();

const getDateKey = (value) => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toDateString() : date.toDateString();
};

const lastDays = (count = 7) => {
  const result = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    result.push({
      key: date.toDateString(),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
    });
  }
  return result;
};

const emptyObject = () => Object.create(null);

const mergeBackendNumber = (backendValue, fallbackValue) => (Number.isFinite(Number(backendValue)) ? Number(backendValue) : fallbackValue);

const mergeList = (backendList, fallbackList) => {
  if (Array.isArray(backendList) && backendList.length) return backendList;
  return Array.isArray(fallbackList) ? fallbackList : [];
};

const normalizeOrderList = (orders = []) => orders.map((order) => normalizeOrder(order));

export const buildAnalyticsSnapshot = ({
  backend = {},
  orders = [],
  products = [],
  users = [],
  rewards = getRewards(),
  savedAddresses = getSavedAddresses(),
} = {}) => {
  const safeOrders = normalizeOrderList(Array.isArray(orders) ? orders : getLocalOrders());
  const safeProducts = Array.isArray(products) ? products : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRewards = Array.isArray(rewards) ? rewards : [];
  const safeAddresses = Array.isArray(savedAddresses) ? savedAddresses : [];

  const daySeries = lastDays(7);
  const orderSeriesMap = new Map(daySeries.map((day) => [day.key, { label: day.label, orders: 0, revenue: 0 }]));
  const customerSeriesMap = new Map(daySeries.map((day) => [day.key, { label: day.label, customers: new Set() }]));
  const productSales = new Map();
  const categoryStats = new Map();
  const areaStats = new Map();
  const customerStats = new Map();
  const rewardStats = new Map();
  const productCatalogByName = new Map();
  const productCatalogById = new Map();

  safeProducts.forEach((product) => {
    const nameKey = toKey(product.name);
    if (nameKey) productCatalogByName.set(nameKey, product);
    if (product.id || product._id) productCatalogById.set(String(product.id || product._id), product);
  });

  let commissionTotal = 0;
  let todayCommission = 0;
  let deliveredOrders = 0;
  let cancelledOrders = 0;
  let onTimeOrders = 0;
  let etaSum = 0;
  let etaCount = 0;
  const todayKey = new Date().toDateString();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  safeOrders.forEach((order) => {
    const createdAt = new Date(order.createdAt || order.updatedAt || Date.now());
    const updatedAt = new Date(order.updatedAt || order.createdAt || Date.now());
    const total = toNumber(order.total ?? order.totals?.total);
    const etaMinutes = toNumber(order.etaMinutes || String(order.eta || "").replace(/[^\d]/g, "")) || 30;
    const actualMinutes = Math.max(0, Math.round((updatedAt.getTime() - createdAt.getTime()) / 60000));
    const area = order.address?.area || order.address?.city || "Unknown";
    const customerKey = toKey(order.userId || order.phone || order.customer?.phone || order.customerName || "guest");
    const dateKey = getDateKey(createdAt);

    if (!orderSeriesMap.has(dateKey)) {
      orderSeriesMap.set(dateKey, { label: createdAt.toLocaleDateString("en-IN", { weekday: "short" }), orders: 0, revenue: 0 });
    }
    const orderSeriesEntry = orderSeriesMap.get(dateKey);
    orderSeriesEntry.orders += 1;
    orderSeriesEntry.revenue += total;

    if (!customerSeriesMap.has(dateKey)) {
      customerSeriesMap.set(dateKey, { label: createdAt.toLocaleDateString("en-IN", { weekday: "short" }), customers: new Set() });
    }
    customerSeriesMap.get(dateKey).customers.add(customerKey);

    if (!customerStats.has(customerKey)) {
      customerStats.set(customerKey, {
        count: 0,
        firstOrder: createdAt.getTime(),
        lastOrder: createdAt.getTime(),
        area,
      });
    }
    const customer = customerStats.get(customerKey);
    customer.count += 1;
    customer.firstOrder = Math.min(customer.firstOrder, createdAt.getTime());
    customer.lastOrder = Math.max(customer.lastOrder, createdAt.getTime());
    customer.area = customer.area || area;

    areaStats.set(area, {
      count: (areaStats.get(area)?.count || 0) + 1,
      revenue: (areaStats.get(area)?.revenue || 0) + total,
    });

    commissionTotal += toNumber(order.commissionAmount);
    if (dateKey === todayKey) todayCommission += toNumber(order.commissionAmount);

    if (order.status === "delivered") {
      deliveredOrders += 1;
      if (actualMinutes <= etaMinutes * 1.25) onTimeOrders += 1;
    }
    if (order.status === "cancelled") cancelledOrders += 1;

    etaSum += etaMinutes;
    etaCount += 1;

    const couponKey = String(order.couponCode || order.couponUsed || "").trim().toUpperCase();
    const rewardKey = String(order.rewardUsed || "").trim().toUpperCase();
    if (couponKey) {
      rewardStats.set(couponKey, { count: (rewardStats.get(couponKey)?.count || 0) + 1, type: "coupon" });
    }
    if (rewardKey) {
      rewardStats.set(rewardKey, { count: (rewardStats.get(rewardKey)?.count || 0) + 1, type: "reward" });
    }

    (order.items || []).forEach((item) => {
      const itemName = String(item.name || "Item").trim();
      const itemKey = toKey(item.productId || item.id || item._id || itemName);
      const quantity = Math.max(1, toNumber(item.quantity || item.qty || 1));
      const lineRevenue = toNumber(item.price) * quantity;
      const catalogMatch = (item.productId && productCatalogById.get(String(item.productId))) || productCatalogByName.get(toKey(itemName)) || {};
      const category = String(catalogMatch.category || item.category || "uncategorized").trim() || "uncategorized";
      const existing = productSales.get(itemKey) || {
        name: catalogMatch.name || itemName,
        category,
        orders: 0,
        quantity: 0,
        revenue: 0,
        stock: toNumber(catalogMatch.stock),
        available: catalogMatch.available !== false,
      };

      existing.orders += 1;
      existing.quantity += quantity;
      existing.revenue += lineRevenue;
      existing.category = category;
      existing.stock = toNumber(catalogMatch.stock);
      existing.available = catalogMatch.available !== false;
      productSales.set(itemKey, existing);

      categoryStats.set(category, {
        orders: (categoryStats.get(category)?.orders || 0) + quantity,
        revenue: (categoryStats.get(category)?.revenue || 0) + lineRevenue,
      });
    });
  });

  const topSellingProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 8);

  const lowPerformingProducts = safeProducts
    .map((product) => {
      const lookupKey = toKey(product.id || product._id || product.name);
      const sales = productSales.get(lookupKey) || { quantity: 0, revenue: 0 };
      return {
        name: product.name,
        category: product.category,
        stock: toNumber(product.stock),
        available: product.available !== false,
        orders: sales.quantity,
        revenue: sales.revenue,
      };
    })
    .sort((a, b) => a.orders - b.orders || a.revenue - b.revenue)
    .slice(0, 8);

  const outOfStockProducts = safeProducts
    .filter((product) => product.available === false || toNumber(product.stock) <= 0)
    .map((product) => ({
      name: product.name,
      category: product.category,
      stock: toNumber(product.stock),
      available: product.available !== false,
    }))
    .slice(0, 8);

  const categoryPerformance = Array.from(categoryStats.entries())
    .map(([name, stats]) => ({
      name,
      orders: stats.orders,
      revenue: stats.revenue,
      popularity: safeOrders.length ? Math.round((stats.orders / safeOrders.length) * 100) : 0,
    }))
    .sort((a, b) => b.orders - a.orders);

  const orderSeries = Array.from(orderSeriesMap.values()).map((entry) => ({
    label: entry.label,
    orders: entry.orders,
    revenue: entry.revenue,
  }));

  const revenueSeries = orderSeries.map((entry) => ({
    label: entry.label,
    value: entry.revenue,
  }));

  const customerGrowthSeries = Array.from(customerSeriesMap.values()).map((entry) => ({
    label: entry.label,
    customers: entry.customers.size,
  }));

  const topVillages = Array.from(areaStats.entries())
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue);

  const customerList = Array.from(customerStats.values());
  const newCustomers = customerList.filter((customer) => customer.firstOrder >= thirtyDaysAgo.getTime()).length;
  const repeatCustomers = customerList.filter((customer) => customer.count > 1).length;
  const averageOrderSize = safeOrders.length ? (safeOrders.reduce((sum, order) => sum + toNumber(order.total ?? order.totals?.total), 0) / safeOrders.length) : 0;
  const averageEta = etaCount ? etaSum / etaCount : 30;
  const delayedOrders = Math.max(0, deliveredOrders - onTimeOrders);
  const mostActiveDeliveryArea = topVillages[0] || { name: "Unknown", count: 0, revenue: 0 };

  const rewardStatsList = Array.from(rewardStats.entries()).sort((a, b) => b[1].count - a[1].count);
  const popularRewardEntry = rewardStatsList[0];
  const popularReward = popularRewardEntry
    ? { name: popularRewardEntry[0], count: popularRewardEntry[1].count, type: popularRewardEntry[1].type }
    : null;
  const couponUsage = rewardStatsList.filter(([, value]) => value.type === "coupon").reduce((sum, [, value]) => sum + value.count, 0);
  const rewardsUsed = rewardStatsList.filter(([, value]) => value.type === "reward").reduce((sum, [, value]) => sum + value.count, 0);

  const computed = {
    totalOrders: safeOrders.length,
    todayOrders: safeOrders.filter((order) => getDateKey(order.createdAt) === todayKey).length,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: safeOrders.reduce((sum, order) => sum + toNumber(order.total ?? order.totals?.total), 0),
    totalCommission: commissionTotal,
    todayCommission,
    avgOrderValue: averageOrderSize,
    orderSeries,
    revenueSeries,
    customerGrowthSeries,
    topSellingProducts,
    mostAddedToCart: topSellingProducts,
    lowPerformingProducts,
    outOfStockProducts,
    categoryPerformance,
    rewardStats: {
      totalSpins: couponUsage + rewardsUsed,
      rewardsWon: rewardsUsed,
      rewardsUsed,
      popularReward,
      couponUsage,
      offerConversion: safeOrders.length ? couponUsage / safeOrders.length : 0,
    },
    customerInsights: {
      newCustomers,
      repeatCustomers,
      totalCustomers: customerList.length,
      topVillages,
      totalSavedAddresses: safeAddresses.length,
      averageOrderSize,
    },
    deliveryInsights: {
      averageEta,
      ordersDeliveredOnTime: onTimeOrders,
      delayedOrders,
      mostActiveDeliveryArea,
    },
    topSellingItems: topSellingProducts.slice(0, 5).map((item) => ({ name: item.name, count: item.quantity, revenue: item.revenue })),
    topVillages,
    topServices: [],
  };

  return {
    ...computed,
    totalOrders: mergeBackendNumber(backend.totalOrders, computed.totalOrders),
    todayOrders: mergeBackendNumber(backend.todayOrders, computed.todayOrders),
    deliveredOrders: mergeBackendNumber(backend.deliveredOrders, computed.deliveredOrders),
    cancelledOrders: mergeBackendNumber(backend.cancelledOrders, computed.cancelledOrders),
    totalRevenue: mergeBackendNumber(backend.totalRevenue, computed.totalRevenue),
    totalCommission: mergeBackendNumber(backend.totalCommission, computed.totalCommission),
    todayCommission: mergeBackendNumber(backend.todayCommission, computed.todayCommission),
    avgOrderValue: mergeBackendNumber(backend.avgOrderValue, computed.avgOrderValue),
    orderSeries: mergeList(backend.orderSeries || backend.ordersSeries, computed.orderSeries),
    revenueSeries: mergeList(backend.revenueSeries, computed.revenueSeries),
    customerGrowthSeries: mergeList(backend.customerGrowthSeries, computed.customerGrowthSeries),
    topSellingProducts: mergeList(backend.topSellingProducts, computed.topSellingProducts),
    mostAddedToCart: mergeList(backend.mostAddedToCart, computed.mostAddedToCart),
    lowPerformingProducts: mergeList(backend.lowPerformingProducts, computed.lowPerformingProducts),
    outOfStockProducts: mergeList(backend.outOfStockProducts, computed.outOfStockProducts),
    categoryPerformance: mergeList(backend.categoryPerformance, computed.categoryPerformance),
    rewardStats: {
      ...computed.rewardStats,
      ...(backend.rewardStats || {}),
      popularReward: backend.rewardStats?.popularReward || computed.rewardStats.popularReward,
    },
    customerInsights: {
      ...computed.customerInsights,
      ...(backend.customerInsights || {}),
      topVillages: mergeList(backend.customerInsights?.topVillages, computed.customerInsights.topVillages),
    },
    deliveryInsights: {
      ...computed.deliveryInsights,
      ...(backend.deliveryInsights || {}),
      mostActiveDeliveryArea: backend.deliveryInsights?.mostActiveDeliveryArea || computed.deliveryInsights.mostActiveDeliveryArea,
    },
    topSellingItems: mergeList(backend.topSellingItems, computed.topSellingItems),
    topVillages: mergeList(backend.topVillages, computed.topVillages),
    topServices: mergeList(backend.topServices, computed.topServices),
  };
};

export const ADMIN_ANALYTICS_EMPTY = {
  totalOrders: 0,
  todayOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  totalRevenue: 0,
  totalCommission: 0,
  todayCommission: 0,
  avgOrderValue: 0,
  orderSeries: [],
  revenueSeries: [],
  customerGrowthSeries: [],
  topSellingProducts: [],
  mostAddedToCart: [],
  lowPerformingProducts: [],
  outOfStockProducts: [],
  categoryPerformance: [],
  rewardStats: {
    totalSpins: 0,
    rewardsWon: 0,
    rewardsUsed: 0,
    popularReward: null,
    couponUsage: 0,
    offerConversion: 0,
  },
  customerInsights: {
    newCustomers: 0,
    repeatCustomers: 0,
    totalCustomers: 0,
    topVillages: [],
    totalSavedAddresses: 0,
    averageOrderSize: 0,
  },
  deliveryInsights: {
    averageEta: 0,
    ordersDeliveredOnTime: 0,
    delayedOrders: 0,
    mostActiveDeliveryArea: { name: "Unknown", count: 0, revenue: 0 },
  },
  topSellingItems: [],
  topVillages: [],
  topServices: [],
};

