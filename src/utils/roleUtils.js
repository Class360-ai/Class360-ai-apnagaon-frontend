export const TEMP_ADMIN_MODE = true;

export const ROLE_ALIASES = {
  admin: "owner",
  superadmin: "owner",
  owner: "owner",
  shop: "shop_admin",
  shop_owner: "shop_admin",
  shop_admin: "shop_admin",
  delivery: "delivery",
  rider: "delivery",
  customer: "customer",
};

export const ROLE_LABELS = {
  owner: "Owner",
  shop_admin: "Shop Admin",
  delivery: "Delivery Partner",
  customer: "Customer",
};

export const normalizeRole = (role) => {
  const key = String(role || "").trim().toLowerCase();
  if (TEMP_ADMIN_MODE) {
    return key ? "owner" : "customer";
  }
  return ROLE_ALIASES[key] || key || "customer";
};

export const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || "Customer";

export const getRoleHomePath = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "owner") return "/admin/dashboard";
  if (normalized === "shop_admin") return "/shop/dashboard";
  if (normalized === "delivery") return "/delivery/dashboard";
  return "/";
};

export const getRoleRoutes = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "owner") {
    return [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Orders", path: "/admin/orders" },
      { label: "Delivery", path: "/admin/delivery" },
      { label: "Shops", path: "/admin/shops" },
      { label: "Products", path: "/admin/products" },
      { label: "Categories", path: "/admin/categories" },
      { label: "Offers", path: "/admin/offers" },
      { label: "Analytics", path: "/admin/analytics" },
      { label: "Users", path: "/admin/users" },
    ];
  }
  if (normalized === "shop_admin") {
    return [
      { label: "Dashboard", path: "/shop/dashboard" },
      { label: "Products", path: "/shop/products" },
      { label: "Orders", path: "/shop/orders" },
      { label: "Offers", path: "/shop/offers" },
    ];
  }
  if (normalized === "delivery") {
    return [
      { label: "Dashboard", path: "/delivery/dashboard" },
      { label: "Orders", path: "/delivery/orders" },
      { label: "Profile", path: "/delivery/profile" },
    ];
  }
  return [];
};

export const isRoleMatch = (userRole, allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  if (TEMP_ADMIN_MODE && String(userRole || "").trim()) return true;
  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.map(normalizeRole).includes(normalizedUserRole);
};
