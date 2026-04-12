const TEMP_ADMIN_MODE = true;

const ROLE_ALIASES = {
  admin: "owner",
  superadmin: "owner",
  owner: "owner",
  shop: "shop_admin",
  shop_owner: "shop_admin",
  shop_admin: "shop_admin",
  rider: "delivery",
  delivery: "delivery",
  customer: "customer",
};

const normalizeRole = (role) => {
  const key = String(role || "").trim().toLowerCase();
  if (TEMP_ADMIN_MODE) {
    return key ? "owner" : "customer";
  }
  return ROLE_ALIASES[key] || key || "customer";
};

const roleMatches = (currentRole, allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  if (TEMP_ADMIN_MODE && String(currentRole || "").trim()) return true;
  const normalizedCurrent = normalizeRole(currentRole);
  return allowedRoles.map(normalizeRole).includes(normalizedCurrent);
};

module.exports = {
  TEMP_ADMIN_MODE,
  normalizeRole,
  roleMatches,
};
