import { normalizeRole } from "./roleUtils";

export const normalizeDeliveryPartner = (user = {}) => {
  const role = normalizeRole(user.role);
  if (!["delivery", "rider"].includes(role) && !user.vehicle && !user.status) return null;
  const partnerStatus = String(user.currentStatus || user.status || "").toLowerCase() === "busy" || user.available === false || user.isAvailable === false ? "busy" : "available";
  return {
    id: user.id || user._id || "",
    name: user.name || "Delivery Partner",
    phone: user.phone || "",
    area: user.area || user.location || user.shop?.area || "",
    available: partnerStatus === "available",
    status: partnerStatus,
    currentStatus: user.currentStatus || partnerStatus,
    vehicleType: user.vehicleType || user.vehicle || "Bike",
    activeOrdersCount: Number(user.activeOrdersCount) || 0,
    role,
    shopId: user.shopId || null,
    notes: user.notes || "",
  };
};

export const getPartnerDisplayArea = (partner = {}) => partner.area || "Area not set";
