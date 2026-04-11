const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const ADMIN_CATALOG_EVENT = "apnagaon:admin-catalog-updated";

export const ADMIN_PRODUCT_KEY = "apnagaon_admin_products_v1";
export const ADMIN_CATEGORY_KEY = "apnagaon_admin_categories_v1";
export const ADMIN_OFFER_KEY = "apnagaon_admin_offers_v1";
export const ADMIN_SERVICE_KEY = "apnagaon_admin_services_v1";

const dispatchUpdate = (entity) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_CATALOG_EVENT, { detail: { entity, timestamp: Date.now() } }));
};

export const createCatalogId = (prefix) => `${prefix}_${Date.now().toString(36)}`;

export const DEFAULT_ADMIN_PRODUCTS = [
  { id: "prd-milk", name: "Fresh Milk", category: "dairy", price: 28, unit: "1 L", description: "Daily morning milk", image: "", available: true, stock: 24, tags: ["milk", "daily"] },
  { id: "prd-bread", name: "Brown Bread", category: "bakery", price: 40, unit: "1 pack", description: "Soft bakery bread", image: "", available: true, stock: 18, tags: ["bread"] },
  { id: "prd-tea", name: "Tea Leaves", category: "grocery", price: 72, unit: "250 g", description: "Strong everyday chai", image: "", available: true, stock: 12, tags: ["tea"] },
];

export const DEFAULT_ADMIN_CATEGORIES = [
  { id: "cat-grocery", name: "Grocery", slug: "grocery", icon: "🛒", active: true, sortOrder: 1 },
  { id: "cat-dairy", name: "Dairy", slug: "dairy", icon: "🥛", active: true, sortOrder: 2 },
  { id: "cat-services", name: "Services", slug: "services", icon: "🧰", active: true, sortOrder: 3 },
];

export const DEFAULT_ADMIN_OFFERS = [
  { id: "off-apna10", title: "Apna10 Savings", code: "APNA10", offerType: "flat", value: 10, validTill: "", active: true, targetCategory: "grocery", targetProduct: "", bannerText: "Save ₹10 on selected groceries" },
  { id: "off-freedel", title: "Free Delivery", code: "FREEDEL", offerType: "free_delivery", value: 0, validTill: "", active: true, targetCategory: "", targetProduct: "", bannerText: "Free delivery above cart threshold" },
];

export const DEFAULT_ADMIN_SERVICES = [
  { id: "svc-electrician", serviceType: "Electrician", providerName: "Raju Kumar", phone: "9876543220", area: "Azampur", city: "Azamgarh", price: 150, available: true },
  { id: "svc-plumber", serviceType: "Plumber", providerName: "Imran Ansari", phone: "9876543221", area: "Azampur", city: "Azamgarh", price: 180, available: true },
];

const safeParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const normalizeProduct = (product = {}) => ({
  id: product.id || product._id || createCatalogId("prd"),
  name: product.name || "Untitled Product",
  category: product.category || "uncategorized",
  price: Number(product.price) || 0,
  unit: product.unit || "1 unit",
  image: product.image || "",
  description: product.description || "",
  available: product.available !== false,
  stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : 0,
  minStockAlert: Number.isFinite(Number(product.minStockAlert)) ? Number(product.minStockAlert) : 5,
  tags: Array.isArray(product.tags) ? product.tags : String(product.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
});

export const normalizeCategory = (category = {}) => ({
  id: category.id || category._id || createCatalogId("cat"),
  name: category.name || "Untitled Category",
  slug: category.slug || (category.name || "category").toLowerCase().replace(/\s+/g, "-"),
  icon: category.icon || "📦",
  active: category.active !== false,
  sortOrder: Number.isFinite(Number(category.sortOrder)) ? Number(category.sortOrder) : 0,
});

export const normalizeOffer = (offer = {}) => ({
  id: offer.id || offer._id || createCatalogId("off"),
  title: offer.title || "Untitled Offer",
  code: offer.code || "",
  offerType: offer.offerType || "flat",
  value: Number(offer.value) || 0,
  validTill: offer.validTill || "",
  active: offer.active !== false,
  targetCategory: offer.targetCategory || "",
  targetProduct: offer.targetProduct || "",
  bannerText: offer.bannerText || "",
});

export const normalizeService = (service = {}) => ({
  id: service.id || service._id || createCatalogId("svc"),
  serviceType: service.serviceType || "Service",
  providerName: service.providerName || "Provider",
  phone: service.phone || "",
  area: service.area || "",
  city: service.city || "",
  price: Number(service.price) || 0,
  available: service.available !== false,
});

export const loadAdminCollection = (key, fallback = []) => {
  if (!hasStorage()) return fallback.map((item) => ({ ...item }));
  try {
    const saved = safeParse(window.localStorage.getItem(key), null);
    if (Array.isArray(saved) && saved.length) return saved;
    return fallback.map((item) => ({ ...item }));
  } catch {
    return fallback.map((item) => ({ ...item }));
  }
};

export const saveAdminCollection = (key, items, entity = "catalog") => {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
  dispatchUpdate(entity);
};

export const upsertAdminCollection = (key, item, fallback = [], entity = "catalog") => {
  const collection = loadAdminCollection(key, fallback);
  const normalized = item;
  const next = [normalized, ...collection.filter((entry) => (entry.id || entry._id) !== normalized.id)];
  saveAdminCollection(key, next, entity);
  return next;
};

export const removeAdminCollectionItem = (key, id, fallback = [], entity = "catalog") => {
  const collection = loadAdminCollection(key, fallback);
  const next = collection.filter((entry) => (entry.id || entry._id) !== id);
  saveAdminCollection(key, next, entity);
  return next;
};

export const toggleAdminCollectionItem = (key, id, field = "active", fallback = [], entity = "catalog") => {
  const collection = loadAdminCollection(key, fallback);
  const next = collection.map((entry) => ((entry.id || entry._id) === id ? { ...entry, [field]: !entry[field] } : entry));
  saveAdminCollection(key, next, entity);
  return next;
};
