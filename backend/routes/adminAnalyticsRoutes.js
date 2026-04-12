const express = require("express");
const Order = require("../models/Order");
const Partner = require("../models/Partner");
const ServicePartner = require("../models/ServicePartner");
const Product = require("../models/Product");
const User = require("../models/User");
const Address = require("../models/Address");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

const toNumber = (value) => Number(value) || 0;

const getDateKey = (value) => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toDateString() : date.toDateString();
};

const getLastNDays = (days = 7) => {
  const result = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    result.push({
      key: date.toDateString(),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
    });
  }
  return result;
};

const countMapToTopList = (map, limit = 5) =>
  Object.entries(map)
    .sort((a, b) => b[1].count - a[1].count || b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([name, stats]) => ({ name, ...stats }));

router.get("/", requireAuth, roleCheck("owner"), async (req, res) => {
  const [orders, partners, servicePartners, products, users, addresses] = await Promise.all([
    Order.find({}).sort({ createdAt: -1 }).limit(500),
    Partner.find({}).limit(500),
    ServicePartner.find({}).limit(500),
    Product.find({}).limit(1000),
    User.find({}).select("-passwordHash").limit(1000),
    Address.find({}).limit(2000),
  ]);

  const today = new Date().toDateString();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const daySeries = getLastNDays(7);
  const orderSeriesMap = new Map(daySeries.map((day) => [day.key, { label: day.label, orders: 0, revenue: 0 }]));
  const customerSeriesMap = new Map(daySeries.map((day) => [day.key, { label: day.label, customers: new Set() }]));
  const productSales = new Map();
  const categoryStats = new Map();
  const rewardStats = new Map();
  const areaStats = new Map();
  const customerStats = new Map();
  const customerFirstOrder = new Map();
  const productCatalogByName = new Map();
  const productCatalogById = new Map();
  const activeProducts = Array.isArray(products) ? products : [];

  activeProducts.forEach((product) => {
    const key = String(product.name || "").trim().toLowerCase();
    if (key) productCatalogByName.set(key, product);
    if (product._id) productCatalogById.set(String(product._id), product);
  });

  let commissionTotal = 0;
  let todayCommission = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;
  let onTimeCount = 0;
  let etaSum = 0;
  let etaCount = 0;

  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt || order.updatedAt || Date.now());
    const updatedAt = new Date(order.updatedAt || order.createdAt || Date.now());
    const dateKey = getDateKey(createdAt);
    const total = toNumber(order.total || order.totals?.total);
    const etaMinutes = toNumber(order.etaMinutes || order.eta?.replace(/[^\d]/g, "")) || 30;
    const actualMinutes = Math.max(0, Math.round((updatedAt.getTime() - createdAt.getTime()) / 60000));
    const area = order.address?.area || order.address?.city || "Unknown";
    const customerKey = String(order.userId || order.phone || order.customer?.phone || order.customerName || "guest").trim().toLowerCase();

    if (!orderSeriesMap.has(dateKey)) {
      orderSeriesMap.set(dateKey, {
        label: createdAt.toLocaleDateString("en-IN", { weekday: "short" }),
        orders: 0,
        revenue: 0,
      });
    }

    const seriesEntry = orderSeriesMap.get(dateKey);
    seriesEntry.orders += 1;
    seriesEntry.revenue += total;

    if (!customerSeriesMap.has(dateKey)) {
      customerSeriesMap.set(dateKey, {
        label: createdAt.toLocaleDateString("en-IN", { weekday: "short" }),
        customers: new Set(),
      });
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

    if (!customerFirstOrder.has(customerKey) || customerFirstOrder.get(customerKey) > createdAt.getTime()) {
      customerFirstOrder.set(customerKey, createdAt.getTime());
    }

    areaStats.set(area, {
      count: (areaStats.get(area)?.count || 0) + 1,
      revenue: (areaStats.get(area)?.revenue || 0) + total,
    });

    commissionTotal += toNumber(order.commissionAmount);
    if (dateKey === today) {
      todayCommission += toNumber(order.commissionAmount);
    }

    if (order.status === "delivered") {
      deliveredCount += 1;
      if (actualMinutes <= etaMinutes * 1.25) onTimeCount += 1;
    }

    if (order.status === "cancelled") {
      cancelledCount += 1;
    }

    etaSum += etaMinutes;
    etaCount += 1;

    const couponKey = String(order.couponCode || order.couponUsed || "").trim().toUpperCase();
    const rewardKey = String(order.rewardUsed || "").trim().toUpperCase();
    if (couponKey) {
      rewardStats.set(couponKey, {
        count: (rewardStats.get(couponKey)?.count || 0) + 1,
        type: "coupon",
      });
    }
    if (rewardKey) {
      rewardStats.set(rewardKey, {
        count: (rewardStats.get(rewardKey)?.count || 0) + 1,
        type: "reward",
      });
    }

    (order.items || []).forEach((item) => {
      const itemName = String(item.name || "Item").trim();
      const itemKey = String(item.productId || item.id || item._id || itemName).trim().toLowerCase();
      const quantity = Math.max(1, toNumber(item.quantity || item.qty || 1));
      const itemRevenue = toNumber(item.price) * quantity;
      const catalogMatch =
        (item.productId && productCatalogById.get(String(item.productId))) ||
        productCatalogByName.get(itemName.toLowerCase()) ||
        {};

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
      existing.revenue += itemRevenue;
      existing.category = category;
      existing.stock = toNumber(catalogMatch.stock);
      existing.available = catalogMatch.available !== false;
      productSales.set(itemKey, existing);

      categoryStats.set(category, {
        orders: (categoryStats.get(category)?.orders || 0) + quantity,
        revenue: (categoryStats.get(category)?.revenue || 0) + itemRevenue,
      });
    });
  });

  const orderCount = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + toNumber(order.total || order.totals?.total), 0);
  const todayOrders = orders.filter((order) => getDateKey(order.createdAt) === today).length;
  const totalOrders = orderCount;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = customerStats.size;
  const repeatCustomers = Array.from(customerStats.values()).filter((customer) => customer.count > 1).length;
  const newCustomers = Array.from(customerStats.values()).filter((customer) => customer.firstOrder >= last30Days.getTime()).length;

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 8);

  const lowPerformingProducts = activeProducts
    .map((product) => {
      const sales = productSales.get(String(product._id || product.id || product.name).toLowerCase()) || { quantity: 0, revenue: 0 };
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

  const outOfStockProducts = activeProducts
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
      popularity: totalOrders ? Math.round((stats.orders / totalOrders) * 100) : 0,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  const couponUsage = Array.from(rewardStats.values())
    .filter((item) => item.type === "coupon")
    .reduce((sum, item) => sum + item.count, 0);
  const rewardsUsed = Array.from(rewardStats.values())
    .filter((item) => item.type === "reward")
    .reduce((sum, item) => sum + item.count, 0);
  const popularRewardEntry = Array.from(rewardStats.entries()).sort((a, b) => b[1].count - a[1].count)[0];
  const popularReward = popularRewardEntry ? { name: popularRewardEntry[0], count: popularRewardEntry[1].count, type: popularRewardEntry[1].type } : null;

  const ordersSeries = Array.from(orderSeriesMap.values()).map((entry) => ({
    label: entry.label,
    orders: entry.orders,
    revenue: entry.revenue,
  }));

  const revenueSeries = ordersSeries.map((entry) => ({
    label: entry.label,
    value: entry.revenue,
  }));

  const customerSeries = Array.from(customerSeriesMap.values()).map((entry) => ({
    label: entry.label,
    customers: entry.customers.size,
  }));

  const topVillages = countMapToTopList(Object.fromEntries(areaStats), 6).map((item) => ({
    name: item.name,
    count: item.count,
    revenue: item.revenue,
  }));

  const averageEta = etaCount ? etaSum / etaCount : 30;
  const delayedOrders = Math.max(0, deliveredCount - onTimeCount);
  const mostActiveDeliveryArea = topVillages[0] || { name: "Unknown", count: 0, revenue: 0 };

  const totalSavedAddresses = addresses.length;
  const offerConversion = totalOrders ? couponUsage / totalOrders : 0;

  return res.json({
    totalOrders,
    todayOrders,
    deliveredOrders: deliveredCount,
    cancelledOrders,
    totalPartners: partners.length + servicePartners.length,
    activeShops: partners.filter((partner) => partner.status === "approved").length,
    activeServicePartners: servicePartners.filter((partner) => partner.status === "approved").length,
    totalRevenue,
    totalCommission: commissionTotal,
    todayCommission,
    avgOrderValue,
    orderSeries: ordersSeries,
    revenueSeries,
    customerGrowthSeries: customerSeries,
    topSellingProducts: topProducts,
    mostAddedToCart: topProducts,
    lowPerformingProducts,
    outOfStockProducts,
    categoryPerformance,
    rewardStats: {
      totalSpins: couponUsage + rewardsUsed,
      rewardsWon: rewardsUsed,
      rewardsUsed,
      popularReward,
      couponUsage,
      offerConversion,
    },
    customerInsights: {
      newCustomers,
      repeatCustomers,
      totalCustomers: uniqueCustomers,
      topVillages,
      totalSavedAddresses,
      averageOrderSize: avgOrderValue,
    },
    deliveryInsights: {
      averageEta,
      ordersDeliveredOnTime: onTimeCount,
      delayedOrders,
      mostActiveDeliveryArea,
    },
    topSellingItems: topProducts.slice(0, 5).map((item) => ({ name: item.name, count: item.quantity, revenue: item.revenue })),
    topVillages,
    topServices: servicePartners
      .filter((partner) => partner.status === "approved")
      .slice(0, 5)
      .map((partner) => ({ name: partner.serviceType, count: 1 })),
  });
});

module.exports = router;
