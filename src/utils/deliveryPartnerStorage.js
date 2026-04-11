import { normalizeRole } from "./roleUtils";

export const normalizeDeliveryPartner = (user = {}) => {
  const role = normalizeRole(user.role);
  if (!["delivery", "rider"].includes(role)) return null;
  return {
    id: user.id || user._id || "",
    name: user.name || "Delivery Partner",
    phone: user.phone || "",
    area: user.area || user.location || user.shop?.area || "",
    available: user.available !== false,
    vehicleType: user.vehicleType || user.vehicle || "Bike",
    activeOrdersCount: Number(user.activeOrdersCount) || 0,
    role,
    shopId: user.shopId || null,
  };
};

export const getPartnerDisplayArea = (partner = {}) => partner.area || "Area not set";
