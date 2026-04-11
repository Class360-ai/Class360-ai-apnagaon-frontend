const readEnv = (key, fallback = "") => {
  try {
    const value = import.meta.env?.[key];
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  } catch {
    return fallback;
  }
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getApiBaseUrl = () => readEnv("VITE_API_URL", "http://localhost:5000/api");
export const getSupportPhone = () => readEnv("VITE_SUPPORT_PHONE", "9876543210");
export const getWhatsAppNumber = () => readEnv("VITE_WHATSAPP_NUMBER", "918004710164");
export const getDefaultDeliveryEtaMinutes = () => toNumber(readEnv("VITE_DEFAULT_DELIVERY_ETA_MINUTES", "20"), 20);
export const getFreeDeliveryThreshold = () => toNumber(readEnv("VITE_FREE_DELIVERY_THRESHOLD", "199"), 199);
export const getLaunchBrandName = () => readEnv("VITE_APP_NAME", "ApnaGaon");

export const getProductionApiFallback = () => ({
  apiBaseUrl: getApiBaseUrl(),
  supportPhone: getSupportPhone(),
  whatsappNumber: getWhatsAppNumber(),
  deliveryEtaMinutes: getDefaultDeliveryEtaMinutes(),
  freeDeliveryThreshold: getFreeDeliveryThreshold(),
  brandName: getLaunchBrandName(),
});

export default {
  getApiBaseUrl,
  getSupportPhone,
  getWhatsAppNumber,
  getDefaultDeliveryEtaMinutes,
  getFreeDeliveryThreshold,
  getLaunchBrandName,
  getProductionApiFallback,
};
