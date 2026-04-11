export const LOCAL_NOTIFICATIONS_KEY = "apnagaon_local_notifications_v2";
export const LOCAL_NOTIFICATIONS_EVENT = "apnagaon:local-notifications-updated";

const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const safeId = () => `local_notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const readList = () => {
  if (!hasStorage()) return [];
  try {
    const saved = window.localStorage.getItem(LOCAL_NOTIFICATIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeList = (notifications = []) => {
  if (!hasStorage()) return;
  window.localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 120)));
  window.dispatchEvent(new CustomEvent(LOCAL_NOTIFICATIONS_EVENT));
};

const normalizeRoleScope = (role) => String(role || "").trim().toLowerCase();

const normalizeNotification = (notification = {}, fallback = {}) => {
  const role = normalizeRoleScope(notification.role || fallback.role || "customer");
  const userId = String(notification.userId || fallback.userId || "").trim();
  return {
    id: String(notification.id || notification._id || safeId()),
    role,
    userId,
    title: String(notification.title || fallback.title || "Update"),
    message: String(notification.message || fallback.message || ""),
    type: String(notification.type || fallback.type || "system"),
    read: Boolean(notification.read),
    createdAt: notification.createdAt || fallback.createdAt || new Date().toISOString(),
    link: String(notification.link || fallback.link || ""),
    orderId: String(notification.orderId || fallback.orderId || ""),
    meta: notification.meta || fallback.meta || {},
  };
};

const matchesScope = (notification = {}, scope = {}) => {
  const role = normalizeRoleScope(scope.role);
  const userId = String(scope.userId || "").trim();

  const roleMatches = !role || normalizeRoleScope(notification.role || role) === role;
  const userMatches = !userId || !notification.userId || String(notification.userId) === userId;
  return roleMatches && userMatches;
};

const roleSeedMap = {
  customer: [
    {
      title: "Order placed",
      message: "Your ApnaGaon order has been received and is being reviewed.",
      type: "order_update",
      link: "/my-orders",
    },
    {
      title: "Reward expires soon",
      message: "Use your reward wallet before it expires tonight.",
      type: "reward",
      link: "/profile",
    },
    {
      title: "New offer available",
      message: "Free delivery is active on selected essentials today.",
      type: "offer",
      link: "/cart",
    },
  ],
  admin: [
    {
      title: "New shop application",
      message: "A local shop owner has applied to join ApnaGaon.",
      type: "system",
      link: "/admin/shops/applications",
    },
    {
      title: "Pending approvals",
      message: "A quick review is waiting in the admin dashboard.",
      type: "system",
      link: "/admin/shops/applications",
    },
    {
      title: "Delivery issue reported",
      message: "One delivery needs attention from the operations team.",
      type: "system",
      link: "/admin/delivery",
    },
  ],
  shop: [
    {
      title: "New order received",
      message: "A nearby customer has placed a fresh order.",
      type: "order_update",
      link: "/shop/orders",
    },
    {
      title: "Low stock alert",
      message: "One of your products is running low and needs a refill.",
      type: "system",
      link: "/shop/products",
    },
    {
      title: "Offer expired",
      message: "A shop offer has ended and can be refreshed anytime.",
      type: "offer",
      link: "/shop/offers",
    },
  ],
  delivery: [
    {
      title: "New delivery assigned",
      message: "You have been assigned a fresh delivery run.",
      type: "order_update",
      link: "/delivery/orders",
    },
    {
      title: "Pickup pending",
      message: "A shop pickup is waiting for rider action.",
      type: "order_update",
      link: "/delivery/orders",
    },
    {
      title: "Order completed",
      message: "Nice work. One more delivery has been completed.",
      type: "order_update",
      link: "/delivery/orders",
    },
  ],
};

const sortLatestFirst = (notifications = []) =>
  [...notifications].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

const mergeUnique = (notifications = []) => {
  const seen = new Set();
  return notifications.filter((notification) => {
    const key = String(notification?._id || notification?.id || `${notification?.title || ""}:${notification?.createdAt || ""}`);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getLocalNotifications = (scope = {}) => {
  const list = readList().map((notification) =>
    normalizeNotification(notification, {
      role: notification?.role || "customer",
      userId: scope.userId || "",
    })
  );
  const filtered = scope.role || scope.userId ? list.filter((notification) => matchesScope(notification, scope)) : list;
  return sortLatestFirst(filtered);
};

export const getLocalUnreadCount = (scope = {}) => getLocalNotifications(scope).filter((notification) => !notification.read).length;

export const seedLocalNotifications = (scope = {}) => {
  if (!scope.role) return getLocalNotifications(scope);
  const existing = getLocalNotifications(scope);
  if (existing.length) return existing;

  const seeds = (roleSeedMap[normalizeRoleScope(scope.role)] || roleSeedMap.customer).map((item, index) =>
    normalizeNotification(
      {
        ...item,
        id: `${scope.role}_seed_${index + 1}`,
        role: scope.role,
        userId: scope.userId || "",
        read: index > 0,
        createdAt: new Date(Date.now() - index * 1000 * 60 * 22).toISOString(),
      },
      scope
    )
  );

  const nextList = mergeUnique([...seeds, ...readList()]);
  writeList(nextList);
  return getLocalNotifications(scope);
};

export const addLocalNotification = (notification = {}, scope = {}) => {
  const next = normalizeNotification(notification, scope);
  const nextList = mergeUnique([next, ...readList().filter((item) => String(item?.id || item?._id || "") !== next.id)]);
  writeList(nextList);
  return next;
};

export const markLocalNotificationRead = (id, scope = {}) => {
  const nextList = readList().map((notification) => {
    const normalized = normalizeNotification(notification, {
      role: notification?.role || "customer",
      userId: scope.userId || "",
    });
    return normalized.id === String(id) ? { ...normalized, read: true } : normalized;
  });
  writeList(nextList);
  return nextList.find((notification) => notification.id === String(id)) || null;
};

export const markAllLocalNotificationsRead = (scope = {}) => {
  const nextList = readList().map((notification) => {
    const normalized = normalizeNotification(notification, {
      role: notification?.role || "customer",
      userId: scope.userId || "",
    });
    return matchesScope(normalized, scope) ? { ...normalized, read: true } : normalized;
  });
  writeList(nextList);
  return getLocalNotifications(scope).map((notification) => ({ ...notification, read: true }));
};
