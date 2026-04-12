import { productsAPI, servicesAPI, safeFetch } from "./api";
import { getSeedProducts, getSeedServices } from "../data/seed-data";

const safeText = (value, fallback = "") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const titleize = (value = "") =>
  String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildOriginalPrice = (price, discount) => {
  if (!price || !discount) return undefined;
  const ratio = 1 - discount / 100;
  if (ratio <= 0) return undefined;
  return Math.max(price + 1, Math.round(price / ratio));
};

const inferDiscount = (price, originalPrice) => {
  if (!price || !originalPrice || originalPrice <= price) return 0;
  return Math.max(1, Math.round(((originalPrice - price) / originalPrice) * 100));
};

const normalizeId = (item, fallbackName, price, suffix = "item") =>
  item._id || item.id || `${String(fallbackName || suffix).toLowerCase().replace(/\s+/g, "-")}-${price || suffix}`;

const dedupeById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.id || item?._id;
    if (!id || seen.has(String(id))) return false;
    seen.add(String(id));
    return true;
  });
};

export const normalizeCatalogProduct = (item = {}) => {
  const name = safeText(item.name, "Product");
  const price = toNumber(item.price, 0);
  const hasSeedStockFlag = Object.prototype.hasOwnProperty.call(item, "inStock");
  const stock = toNumber(item.stock, hasSeedStockFlag ? (item.inStock ? 1 : 0) : 0);
  const hasStock = item.available !== false && item.inStock !== false && stock > 0;
  const originalPrice = toNumber(item.originalPrice, 0) || buildOriginalPrice(price, toNumber(item.discount, 0));
  const discount = inferDiscount(price, originalPrice);

  return {
    ...item,
    id: normalizeId(item, name, price, "product"),
    name,
    nameHi: safeText(item.nameHi, name),
    category: safeText(item.category, "grocery"),
    categoryName: safeText(item.categoryName, titleize(item.category || "Product")),
    price,
    originalPrice,
    unit: safeText(item.unit, "1 piece"),
    image: safeText(item.image, "https://via.placeholder.com/220x220?text=Product"),
    description: safeText(item.description, ""),
    descriptionHi: safeText(item.descriptionHi, safeText(item.description, "")),
    available: hasStock,
    stock,
    minStockAlert: toNumber(item.minStockAlert, 5),
    badge: safeText(item.badge, hasStock ? "Available" : "Out of Stock"),
    badgeHi: safeText(item.badgeHi, safeText(item.badge, hasStock ? "Available" : "Out of Stock")),
    discount: discount || undefined,
    rating: toNumber(item.rating, 4.5),
    reviews: toNumber(item.reviews, Math.max(10, stock * 2)),
    deliveryTime: safeText(item.deliveryTime, "10-20 min"),
    quantity: toNumber(item.quantity, 1),
  };
};

export const normalizeCatalogService = (item = {}) => {
  const name = safeText(item.name, "Service");
  const fee = toNumber(item.fee ?? item.price, 0);
  const provider = safeText(item.provider || item.providerName, name);
  const available = item.available !== false;

  return {
    ...item,
    id: normalizeId(item, name, fee, "service"),
    name,
    nameHi: safeText(item.nameHi, name),
    provider,
    providerHi: safeText(item.providerHi, provider),
    category: safeText(item.category, "service"),
    categoryName: safeText(item.categoryName, titleize(item.serviceType || item.category || "Service")),
    area: safeText(item.area, safeText(item.city, "")),
    areaHi: safeText(item.areaHi, safeText(item.area, "")),
    fee,
    feeType: safeText(item.feeType, fee ? "per visit" : ""),
    image: safeText(item.image, "https://via.placeholder.com/220x220?text=Service"),
    description: safeText(item.description, ""),
    descriptionHi: safeText(item.descriptionHi, safeText(item.description, "")),
    available,
    rating: toNumber(item.rating, 4.6),
    badge: safeText(item.badge, available ? "Available" : "Unavailable"),
    badgeHi: safeText(item.badgeHi, safeText(item.badge, available ? "Available" : "Unavailable")),
    phone: safeText(item.phone, ""),
    whatsapp: safeText(item.whatsapp, safeText(item.phone, "")),
  };
};

const useBackendListOrFallback = async (apiCall, fallbackList, normalizer) => {
  const backendList = await safeFetch(() => apiCall(), null);
  if (Array.isArray(backendList) && backendList.length > 0) {
    return dedupeById(backendList.map((item) => normalizer(item)).filter(Boolean));
  }
  return dedupeById(fallbackList.map((item) => normalizer(item)).filter(Boolean));
};

export const loadCatalogProducts = async () =>
  useBackendListOrFallback(productsAPI.getAll, getSeedProducts(), normalizeCatalogProduct);

export const loadCatalogServices = async () =>
  useBackendListOrFallback(servicesAPI.getAll, getSeedServices(), normalizeCatalogService);

export const searchCatalog = (items = [], query = "") => {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return [];

  return (Array.isArray(items) ? items : []).filter((item) => {
    const haystack = [
      item.name,
      item.nameHi,
      item.description,
      item.descriptionHi,
      item.category,
      item.categoryName,
      item.unit,
      item.provider,
      item.area,
      item.city,
      item.badge,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
};

export const filterProductsByCategory = (items = [], category = "") => {
  const normalizedCategory = String(category || "").trim().toLowerCase();
  if (!normalizedCategory || normalizedCategory === "all") return Array.isArray(items) ? items : [];

  return (Array.isArray(items) ? items : []).filter((item) => {
    const haystack = [
      item.category,
      item.categoryName,
      item.name,
      item.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedCategory);
  });
};

export default {
  loadCatalogProducts,
  loadCatalogServices,
  normalizeCatalogProduct,
  normalizeCatalogService,
  searchCatalog,
  filterProductsByCategory,
};
