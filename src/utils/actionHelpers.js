export const APNAGAON_WHATSAPP_NUMBER = "918004710164";

const safeText = (value, fallback = "N/A") => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
};

export const buildWhatsAppMessage = ({ itemName, categoryName, sectionTitle, intent, lang = "en" }) => {
  const name = safeText(itemName, lang === "hi" ? "आइटम" : "Item");
  const category = safeText(categoryName, lang === "hi" ? "सामान्य" : "General");
  const section = safeText(sectionTitle, lang === "hi" ? "खोज" : "Explore");
  const action = safeText(intent, lang === "hi" ? "जानकारी" : "Inquiry");

  if (lang === "hi") {
    return [
      `नमस्ते, मुझे ApnaGaon पर "${name}" के लिए ${action} करनी है।`,
      `Category: ${category}`,
      `Section: ${section}`,
      `Action: ${action}`,
    ].join("\n");
  }

  return [
    `Namaste, I want "${name}" on ApnaGaon.`,
    `Category: ${category}`,
    `Section: ${section}`,
    `Action: ${action}`,
  ].join("\n");
};

export const openWhatsApp = (message) => {
  const encoded = encodeURIComponent(message || "Namaste ApnaGaon");
  const url = `https://wa.me/${APNAGAON_WHATSAPP_NUMBER}?text=${encoded}`;
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export const openCall = (phone) => {
  if (!phone) {
    return false;
  }
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) {
    return false;
  }
  if (typeof window !== "undefined") {
    window.location.href = `tel:${digits}`;
  }
  return true;
};

export const handleCardAction = ({
  actionType,
  entry,
  categoryName,
  sectionTitle,
  addToCart,
  onView,
  onFeedback,
  lang = "en",
}) => {
  const intentMap = {
    cart: lang === "hi" ? "ऑर्डर" : "Order",
    whatsapp: lang === "hi" ? "ऑर्डर" : "Order",
    inquiry: lang === "hi" ? "जानकारी" : "Inquiry",
    book: lang === "hi" ? "बुकिंग" : "Booking",
    call: lang === "hi" ? "कॉल" : "Call",
    view: lang === "hi" ? "देखें" : "View",
  };

  const normalizedType = actionType || entry?.actionType || "view";
  const message = buildWhatsAppMessage({
    itemName: entry?.name,
    categoryName,
    sectionTitle,
    intent: intentMap[normalizedType] || "Inquiry",
    lang,
  });

  switch (normalizedType) {
    case "cart": {
      if (typeof addToCart === "function") {
        addToCart({
          id: entry?.id || `${categoryName}-${entry?.name || "item"}`,
          name: entry?.name || (lang === "hi" ? "आइटम" : "Item"),
          image: "",
          price: entry?.price || 0,
          unit: entry?.subtitle || "",
        });
        if (typeof onFeedback === "function") {
          onFeedback(
            lang === "hi"
              ? `${entry?.name || "आइटम"} कार्ट में जोड़ दिया गया`
              : `${entry?.name || "Item"} added to cart`
          );
        }
      }
      return;
    }
    case "whatsapp":
    case "book":
    case "inquiry":
      openWhatsApp(message);
      return;
    case "call": {
      const called = openCall(entry?.phone);
      if (!called) {
        openWhatsApp(message);
      }
      return;
    }
    case "view":
    default:
      if (typeof onView === "function") {
        onView(entry, categoryName, sectionTitle);
      } else if (typeof window !== "undefined") {
        window.alert(
          lang === "hi"
            ? `${entry?.name || "आइटम"} का विवरण जल्द उपलब्ध होगा`
            : `${entry?.name || "Item"} details coming soon`
        );
      }
  }
};
