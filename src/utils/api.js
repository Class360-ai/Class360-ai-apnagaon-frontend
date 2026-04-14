// API Service Layer for ApnaGaon Backend Integration
// This service will communicate with the Node.js backend

import { getApiBaseUrl } from "./runtimeConfig";

const API_BASE_URL = getApiBaseUrl();
export const AUTH_STORAGE_KEY = "apnagaon_auth_v1";
export const TOKEN_STORAGE_KEY = "token";
const REQUEST_TIMEOUT_MS = 15000;

if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
  console.info("[ApnaGaon] API base URL:", API_BASE_URL);
}

export const getAuthToken = () => {
  try {
    const directToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (directToken) return directToken;
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved)?.token || "" : "";
  } catch {
    return "";
  }
};

export const setAuthToken = (token = "") => {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage failures
  }
};

export const clearAuthToken = () => {
  setAuthToken("");
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const normalizedEndpoint = endpoint.startsWith("/api/")
    ? endpoint
    : endpoint.startsWith("/api")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        ...options.headers,
      },
      signal: controller?.signal,
      ...options,
    });

    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.message || errorMessage;
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          // ignore text parse errors
        }
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    console.error("API call failed:", error);
    throw error;
  }
};

// Products API
export const productsAPI = {
  getAll: () => apiCall("/products"),
  search: (query) => apiCall(`/products/search?q=${query}`),
  getByCategory: (category) => apiCall(`/products/category/${category}`),
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiCall(`/products/${id}`, { method: "DELETE" }),
};

export const partnersAPI = {
  apply: (data) => apiCall("/partners/apply", { method: "POST", body: JSON.stringify(data) }),
  approved: () => apiCall("/partners/approved"),
  statusByPhone: (phone) => apiCall(`/partners/status?phone=${encodeURIComponent(phone)}`),
  adminList: () => apiCall("/admin/partners"),
  updateStatus: (id, status, reviewNote = "") =>
    apiCall(`/admin/partners/${id}/status`, { method: "PUT", body: JSON.stringify({ status, reviewNote }) }),
};

export const deliveryPartnersAPI = {
  getAll: (options = {}) => {
    const params = new URLSearchParams();
    if (options.includeUnavailable) params.set("includeUnavailable", "true");
    const query = params.toString();
    return apiCall(`/delivery-partners${query ? `?${query}` : ""}`);
  },
  create: (data) => apiCall("/delivery-partners", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/delivery-partners/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiCall(`/delivery-partners/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  seed: () => apiCall("/delivery-partners/seed", { method: "POST" }),
};

export const servicePartnersAPI = {
  apply: (data) => apiCall("/service-partners/apply", { method: "POST", body: JSON.stringify(data) }),
  approved: () => apiCall("/service-partners/approved"),
  adminList: () => apiCall("/admin/service-partners"),
  updateStatus: (id, status) => apiCall(`/admin/service-partners/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
};

export const analyticsAPI = {
  getAdmin: () => apiCall("/admin/analytics"),
};

// Services API
export const servicesAPI = {
  getAll: () => apiCall("/services"),
  search: (query) => apiCall(`/services/search?q=${query}`),
  getByCategory: (category) => apiCall(`/services/category/${category}`),
  getById: (id) => apiCall(`/services/${id}`),
  getNearby: (lat, lon, radius = 10) => apiCall(`/services/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
  create: (data) => apiCall("/services", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/services/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiCall(`/services/${id}`, { method: "DELETE" }),
};

// Shops API
export const shopsAPI = {
  getAll: () => apiCall("/shops"),
  getNearby: (lat, lon, radius = 10) => apiCall(`/shops/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
  create: (data) => apiCall("/shops", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/shops/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// Orders API
export const ordersAPI = {
  create: (data) => apiCall("/orders", { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiCall("/orders"),
  getMine: () => apiCall("/orders/me"),
  getById: (id) => apiCall(`/orders/${id}`),
  getByPhone: (phone) => apiCall(`/orders/phone/${phone}`),
  updateStatus: (id, status) => 
    apiCall(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  assignDeliveryPartner: (id, data) => apiCall(`/orders/${id}/assign-rider`, { method: "PUT", body: JSON.stringify(data) }),
};

export const paymentsAPI = {
  create: (data) => apiCall("/payments", { method: "POST", body: JSON.stringify(data) }),
  getById: (id) => apiCall(`/payments/${id}`),
  getByOrderId: (orderId) => apiCall(`/payments/order/${orderId}`),
  verify: (id, data) => apiCall(`/payments/${id}/verify`, { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id, status, transactionId = "") =>
    apiCall(`/payments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, transactionId }) }),
};

export const authAPI = {
  login: (data) => apiCall("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data) => apiCall("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  signup: (data) => apiCall("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  me: () => apiCall("/auth/me"),
  updateMe: (data) => apiCall("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
  logout: () => apiCall("/auth/logout", { method: "POST" }),
  users: () => apiCall("/auth/users"),
};

export const addressesAPI = {
  getAll: () => apiCall("/addresses"),
  create: (data) => apiCall("/addresses", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => apiCall(`/addresses/${id}`, { method: "DELETE" }),
};

export const notificationsAPI = {
  getAll: () => apiCall("/notifications"),
  unreadCount: () => apiCall("/notifications/unread-count"),
  readOne: (id) => apiCall(`/notifications/${id}/read`, { method: "PATCH" }),
  readAll: () => apiCall("/notifications/read-all", { method: "PATCH" }),
};

// Inquiries API
export const inquiriesAPI = {
  create: (data) => apiCall("/inquiries", { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiCall("/inquiries"),
  getById: (id) => apiCall(`/inquiries/${id}`),
  updateStatus: (id, status) => 
    apiCall(`/inquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiCall("/categories"),
};

// Seeds API (for development/admin)
export const seedsAPI = {
  seedProducts: (payload = {}) => apiCall("/seed-products", { method: "POST", body: JSON.stringify(payload) }),
  seedServices: () => apiCall("/seeds/services", { method: "POST" }),
  clearAll: () => apiCall("/seeds/clear", { method: "POST" }),
};

// Safe wrapper for API calls with fallback to local data
export const safeFetch = async (apiFunction, fallbackData = null) => {
  try {
    return await apiFunction();
  } catch (error) {
    console.warn("API fetch failed, using fallback data:", error?.message || error);
    return fallbackData || null;
  }
};

export default {
  productsAPI,
  shopsAPI,
  servicesAPI,
  ordersAPI,
  paymentsAPI,
  inquiriesAPI,
  categoriesAPI,
  seedsAPI,
  authAPI,
  addressesAPI,
  notificationsAPI,
  partnersAPI,
  deliveryPartnersAPI,
  servicePartnersAPI,
  analyticsAPI,
  safeFetch,
};
