// WhatsApp utilities for safe prefilled messages

import { getWhatsAppNumber } from "./runtimeConfig";

export const generateWhatsAppMessage = (type, data) => {
  switch (type) {
    case "product-order":
      return generateProductOrderMessage(data);
    case "service-inquiry":
      return generateServiceInquiryMessage(data);
    case "cart-order":
      return generateCartOrderMessage(data);
    case "checkout-order":
      return generateCheckoutOrderMessage(data);
    case "partner-signup":
      return generatePartnerSignupMessage(data);
    default:
      return generateDefaultMessage(data);
  }
};

const generatePartnerSignupMessage = (data) => {
  const {
    businessName = "Business",
    ownerName = "Owner",
    phone = "",
    whatsapp = "",
    category = "Category",
    village = "Azamgarh",
    address = "",
    timings = "",
    description = "",
    deliveryAvailable = false,
    serviceArea = "",
    imageUrl = "",
    type = "shop",
    lang = "en",
  } = data;

  const greeting = lang === "hi" ? "नमस्ते ApnaGaon," : "Hello ApnaGaon,";
  const intro = lang === "hi" ? "मैं अपना व्यवसाय जोड़ना चाहता हूँ:" : "I would like to list my business:";
  const businessLabel = lang === "hi" ? "व्यवसाय का नाम" : "Business Name";
  const ownerLabel = lang === "hi" ? "स्वामी का नाम" : "Owner Name";
  const phoneLabel = lang === "hi" ? "फ़ोन" : "Phone";
  const whatsappLabel = lang === "hi" ? "WhatsApp" : "WhatsApp";
  const categoryLabel = lang === "hi" ? "श्रेणी" : "Category";
  const villageLabel = lang === "hi" ? "गाँव" : "Village";
  const addressLabel = lang === "hi" ? "पता" : "Address";
  const timingsLabel = lang === "hi" ? "समय" : "Timings";
  const descriptionLabel = lang === "hi" ? "विवरण" : "Description";
  const deliveryLabel = lang === "hi" ? "डिलीवरी उपलब्ध" : "Delivery Available";
  const serviceAreaLabel = lang === "hi" ? "सेवा क्षेत्र" : "Service Area";
  const imageLabel = lang === "hi" ? "इमेज लिंक" : "Image URL";
  const typeLabel = lang === "hi" ? "प्रकार" : "Type";
  const confirm = lang === "hi" ? "कृपया मेरी सूची की पुष्टि करें।" : "Please confirm my listing.";

  return `${greeting}

${intro}
${businessLabel}: ${businessName}
${ownerLabel}: ${ownerName}
${phoneLabel}: ${phone}
${whatsappLabel}: ${whatsapp}
${typeLabel}: ${type}
${categoryLabel}: ${category}
${villageLabel}: ${village}
${addressLabel}: ${address}
${timingsLabel}: ${timings}
${deliveryLabel}: ${deliveryAvailable ? (lang === "hi" ? "हाँ" : "Yes") : (lang === "hi" ? "नहीं" : "No")}
${serviceAreaLabel}: ${serviceArea}
${descriptionLabel}: ${description}
${imageLabel}: ${imageUrl}

${confirm}`;
};

const generateProductOrderMessage = (data) => {
  const {
    productName = "Product",
    quantity = 1,
    price = 0,
    category = "Product",
    unit = "",
    village = "Azamgarh",
    lang = "en",
  } = data;

  const greeting = lang === "hi" ? "नमस्ते ApnaGaon," : "Hello ApnaGaon,";
  const wantOrder = lang === "hi" ? "मुझे ऑर्डर करना है:" : "I want to order:";
  const itemLabel = lang === "hi" ? "आइटम" : "Item";
  const categoryLabel = lang === "hi" ? "श्रेणी" : "Category";
  const quantityLabel = lang === "hi" ? "मात्रा" : "Quantity";
  const priceLabel = lang === "hi" ? "कीमत" : "Price";
  const locationLabel = lang === "hi" ? "स्थान" : "Location";
  const confirm =
    lang === "hi"
      ? "कृपया उपलब्धता की पुष्टि करें।"
      : "Please confirm availability.";

  const message = `${greeting}

${wantOrder}
${itemLabel}: ${productName}
${categoryLabel}: ${category}
${quantityLabel}: ${quantity} ${unit}
${priceLabel}: ₹${price}
${locationLabel}: ${village}

${confirm}`;

  return message;
};

const generateServiceInquiryMessage = (data) => {
  const {
    serviceName = "Service",
    category = "Service",
    fee = "",
    village = "Azamgarh",
    lang = "en",
  } = data;

  const greeting = lang === "hi" ? "नमस्ते ApnaGaon," : "Hello ApnaGaon,";
  const wantInquire = lang === "hi" ? "मुझे पूछताछ करनी है:" : "I want to inquire about:";
  const serviceLabel = lang === "hi" ? "सेवा" : "Service";
  const categoryLabel = lang === "hi" ? "श्रेणी" : "Category";
  const feeLabel = lang === "hi" ? "फीस" : "Fee";
  const locationLabel = lang === "hi" ? "स्थान" : "Location";
  const share =
    lang === "hi"
      ? "कृपया विवरण और उपलब्धता साझा करें।"
      : "Please share details and availability.";

  let message = `${greeting}

${wantInquire}
${serviceLabel}: ${serviceName}
${categoryLabel}: ${category}`;

  if (fee) {
    message += `\n${feeLabel}: ${fee}`;
  }

  message += `\n${locationLabel}: ${village}\n\n${share}`;

  return message;
};

const generateCartOrderMessage = (data) => {
  const {
    items = [],
    totalPrice = 0,
    village = "Azamgarh",
    paymentMethod = "COD",
    lang = "en",
  } = data;

  const greeting = lang === "hi" ? "नमस्ते ApnaGaon," : "Hello ApnaGaon,";
  const wantOrder = lang === "hi" ? "मुझे ऑर्डर करना है:" : "I want to order:";
  const itemsLabel = lang === "hi" ? "आइटम" : "Items";
  const paymentLabel = lang === "hi" ? "भुगतान विधि" : "Payment Method";
  const totalLabel = lang === "hi" ? "कुल" : "Total";
  const locationLabel = lang === "hi" ? "स्थान" : "Location";
  const confirm =
    lang === "hi"
      ? "कृपया जांच लें और पुष्टि करें।"
      : "Please verify and confirm order.";

  const paymentLabelValue = paymentMethod || (lang === "hi" ? "कैश ऑन डिलीवरी" : "Cash on Delivery");

  let itemsList = items
    .map((item) => `- ${item.name} x${item.qty} @ ₹${item.price} = ₹${item.price * item.qty}`)
    .join("\n");

  const message = `${greeting}

${wantOrder}

${itemsLabel}:
${itemsList}

${paymentLabel}: ${paymentLabelValue}
${totalLabel}: ₹${totalPrice}
${locationLabel}: ${village}

${confirm}`;

  return message;
};

const generateCheckoutOrderMessage = (data) => {
  const {
    items = [],
    totalPrice = 0,
    paymentMethod = "Cash on Delivery",
    village = "Azamgarh",
    address = "",
    phone = "",
    lang = "en",
  } = data;

  const greeting = lang === "hi" ? "नमस्ते ApnaGaon," : "Hello ApnaGaon,";
  const wantOrder = lang === "hi" ? "मुझे ऑर्डर करना है:" : "I want to order:";
  const itemsLabel = lang === "hi" ? "आइटम" : "Items";
  const paymentLabel = lang === "hi" ? "भुगतान विधि" : "Payment Method";
  const totalLabel = lang === "hi" ? "कुल" : "Total";
  const locationLabel = lang === "hi" ? "स्थान" : "Location";
  const addressLabel = lang === "hi" ? "पता" : "Address";
  const phoneLabel = lang === "hi" ? "फ़ोन" : "Phone";
  const confirm =
    lang === "hi"
      ? "कृपया जांच लें और पुष्टि करें।"
      : "Please verify and confirm order.";

  let itemsList = items
    .map((item) => `- ${item.name} x${item.quantity || item.qty} @ ₹${item.price} = ₹${(item.price || 0) * (item.quantity || item.qty)}`)
    .join("\n");

  const message = `${greeting}

${wantOrder}

${itemsLabel}:
${itemsList}

${paymentLabel}: ${paymentMethod}
${totalLabel}: ₹${totalPrice}
${locationLabel}: ${village}
${addressLabel}: ${address}
${phoneLabel}: ${phone}

${confirm}`;

  return message;
};

const generateDefaultMessage = (data) => {
  const { message = "Hello" } = data;
  return message;
};

// Generate WhatsApp link with prefilled message
export const getWhatsAppLink = (message) => {
  const encodedMessage = encodeURIComponent(message);
  const businessNumber = getWhatsAppNumber();
  return `https://wa.me/${businessNumber}?text=${encodedMessage}`;
};

// Get WhatsApp link for direct service provider contact
export const getDirectWhatsAppLink = (phoneNumber, message) => {
  if (!phoneNumber) return null;
  // Remove all non-digits from phone number
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};

// Safe utility to generate message without crashing on missing fields
export const safeGenerateMessage = (type, data = {}) => {
  try {
    return generateWhatsAppMessage(type, {
      ...data,
      productName: data.productName || "Product",
      serviceName: data.serviceName || "Service",
      quantity: data.quantity || 1,
      price: data.price || 0,
      category: data.category || "Category",
      village: data.village || "Azamgarh",
      lang: data.lang || "en",
    });
  } catch (error) {
    console.error("Error generating WhatsApp message:", error);
    return "Hello ApnaGaon, Please help me.";
  }
};

// Safe utility to get WhatsApp link
export const safeGetWhatsAppLink = (message) => {
  if (!message) return "javascript:void(0)";
  try {
    return getWhatsAppLink(message);
  } catch (error) {
    console.error("Error generating WhatsApp link:", error);
    return "javascript:void(0)";
  }
};

export default {
  generateWhatsAppMessage,
  getWhatsAppLink,
  getDirectWhatsAppLink,
  safeGenerateMessage,
  safeGetWhatsAppLink,
};
