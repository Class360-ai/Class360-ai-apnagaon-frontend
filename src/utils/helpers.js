// Helper utilities for ApnaGaon

export const formatPrice = (price) => {
  return `₹${price}`;
};

export const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN");
};

export const getDiscountPercentage = (original, current) => {
  if (!original || !current) return 0;
  return Math.round(((original - current) / original) * 100);
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export const truncate = (text, length = 50) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

export const sanitizePhone = (phone) => {
  return phone?.replace(/\D/g, "") || "";
};

export const isValidPhone = (phone) => {
  const cleaned = sanitizePhone(phone);
  return cleaned.length === 10 || cleaned.length === 12;
};

export const formatPhone = (phone) => {
  const cleaned = sanitizePhone(phone);
  if (cleaned.length === 10) {
    return `+91-${cleaned}`;
  }
  if (cleaned.length === 12) {
    return `+${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
  }
  return phone;
};

export const getRating = (rating, maxRating = 5) => {
  return {
    stars: Math.round(rating * 2) / 2,
    percentage: (rating / maxRating) * 100,
    display: rating?.toFixed(1) || "4.5",
  };
};

export const getInitials = (name) => {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    "inquiry-sent": "bg-purple-100 text-purple-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status, lang = "en") => {
  const labels = {
    en: {
      pending: "Pending",
      confirmed: "Confirmed",
      delivered: "Delivered",
      cancelled: "Cancelled",
      "inquiry-sent": "Inquiry Sent",
    },
    hi: {
      pending: "लंबित",
      confirmed: "पुष्टि किया गया",
      delivered: "डिलीवर हो गया",
      cancelled: "रद्द किया गया",
      "inquiry-sent": "पूछताछ भेजी गई",
    },
  };
  return labels[lang]?.[status] || status;
};

export const getAvailabilityStatus = (available = true, lang = "en") => {
  if (available) {
    return lang === "hi" ? "आज उपलब्ध" : "Available Today";
  }
  return lang === "hi" ? "उपलब्ध नहीं" : "Out of Stock";
};

export const calculateTax = (amount, taxPercent = 5) => {
  return Number(((amount * taxPercent) / 100).toFixed(2));
};

export const calculateDiscount = (original, discount) => {
  if (typeof discount === "number" && discount > 0) {
    if (discount > 100) {
      // Discount is amount
      return discount;
    } else {
      // Discount is percentage
      return Number(((original * discount) / 100).toFixed(2));
    }
  }
  return 0;
};

export const addToast = (message, type = "success") => {
  // This will be integrated with a toast context/provider
  console.log(`Toast [${type}]: ${message}`);
};

export default {
  formatPrice,
  formatCurrency,
  formatDate,
  getDiscountPercentage,
  slugify,
  truncate,
  sanitizePhone,
  isValidPhone,
  formatPhone,
  getRating,
  getInitials,
  getStatusBadgeColor,
  getStatusLabel,
  getAvailabilityStatus,
  calculateTax,
  calculateDiscount,
  addToast,
};
