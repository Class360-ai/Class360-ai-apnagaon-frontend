const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const SHOP_APPLICATIONS_KEY = "apnagaon_shop_applications_v1";
export const SHOP_APPLICATIONS_EVENT = "apnagaon:shop-applications-updated";

const safeParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const createShopApplicationId = () => `shopapp_${Date.now().toString(36)}`;

export const normalizeShopApplication = (application = {}) => ({
  id: application.id || application._id || createShopApplicationId(),
  shopName: application.shopName || application.businessName || "Untitled Shop",
  ownerName: application.ownerName || "",
  phone: application.phone || "",
  whatsapp: application.whatsapp || application.phone || "",
  category: application.category || "grocery",
  area: application.area || application.village || "",
  address: application.address || "",
  city: application.city || "",
  state: application.state || "",
  pincode: application.pincode || "",
  deliveryAvailable: application.deliveryAvailable !== false,
  upiId: application.upiId || "",
  description: application.description || "",
  openingTime: application.openingTime || application.timings?.split("-")?.[0]?.trim() || "",
  closingTime: application.closingTime || application.timings?.split("-")?.[1]?.trim() || "",
  logo: application.logo || application.image || application.imageUrl || "",
  idProof: application.idProof || "",
  addressProof: application.addressProof || "",
  status: application.status || "pending",
  reviewNote: application.reviewNote || application.note || "",
  createdAt: application.createdAt || new Date().toISOString(),
  updatedAt: application.updatedAt || application.createdAt || new Date().toISOString(),
  shopId: application.shopId || null,
  lat: application.lat === null || application.lat === undefined ? null : Number(application.lat),
  lon: application.lon === null || application.lon === undefined ? null : Number(application.lon),
});

const dispatchUpdate = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SHOP_APPLICATIONS_EVENT));
};

export const loadShopApplications = () => {
  if (!hasStorage()) return [];
  try {
    const saved = window.localStorage.getItem(SHOP_APPLICATIONS_KEY);
    const parsed = safeParse(saved, []);
    return Array.isArray(parsed) ? parsed.map(normalizeShopApplication) : [];
  } catch {
    return [];
  }
};

export const saveShopApplications = (items = []) => {
  if (!hasStorage()) return items.map(normalizeShopApplication);
  const normalized = items.map(normalizeShopApplication);
  window.localStorage.setItem(SHOP_APPLICATIONS_KEY, JSON.stringify(normalized));
  dispatchUpdate();
  return normalized;
};

export const upsertShopApplication = (application = {}) => {
  const normalized = normalizeShopApplication(application);
  const current = loadShopApplications();
  const next = [normalized, ...current.filter((item) => item.id !== normalized.id && item.phone !== normalized.phone)];
  return saveShopApplications(next);
};

export const updateShopApplicationStatus = (id, status, reviewNote = "") => {
  const current = loadShopApplications();
  const next = current.map((item) =>
    item.id === id || item._id === id
      ? { ...item, status, reviewNote, updatedAt: new Date().toISOString() }
      : item
  );
  return saveShopApplications(next);
};

export const findShopApplicationByPhone = (phone) => {
  const normalizedPhone = String(phone || "").trim();
  if (!normalizedPhone) return null;
  return loadShopApplications()
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .find((item) => String(item.phone || "").trim() === normalizedPhone || String(item.whatsapp || "").trim() === normalizedPhone) || null;
};
