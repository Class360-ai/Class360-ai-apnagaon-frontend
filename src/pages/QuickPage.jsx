import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, ChevronLeft, Clock3 } from "lucide-react";
import QuickSection from "../components/QuickSection";
import QuickCard from "../components/QuickCard";
import { getWhatsAppLink } from "../utils/whatsappUtils";
import "./QuickPage.css";

const DEFAULT_SUPPORT_PHONE = "918004710164";

const DEFAULT_DATA = {
  supportPhone: DEFAULT_SUPPORT_PHONE,
  fastDelivery: [
    { id: "milk", name: "Milk", icon: "🥛", badge: "Popular" },
    { id: "bread", name: "Bread", icon: "🍞", badge: "Fast" },
    { id: "water", name: "Water", icon: "🚰", badge: "Popular" },
    { id: "eggs", name: "Eggs", icon: "🥚", badge: "Fast" },
    { id: "snacks", name: "Snacks", icon: "🍪", badge: "Popular" },
  ],
  quickServices: [
    { id: "electrician", name: "Electrician", icon: "⚡", subtitle: "Available now" },
    { id: "plumber", name: "Plumber", icon: "🔧", subtitle: "Available now" },
    { id: "bike-ride", name: "Bike Ride", icon: "🛵", subtitle: "Pickup in minutes" },
    { id: "mobile-repair", name: "Mobile Repair", icon: "📱", subtitle: "Doorstep support" },
  ],
  emergencyHelp: [
    { id: "ambulance", name: "Ambulance", icon: "🚑", subtitle: "Immediate response" },
    { id: "doctor-call", name: "Doctor Call", icon: "👨‍⚕️", subtitle: "Talk to doctor now" },
    { id: "medicine-help", name: "Medicine Help", icon: "💊", subtitle: "Medicine guidance" },
  ],
  dailyCombos: [
    { id: "milk-route", name: "Milk Route", icon: "🥛", subtitle: "Daily morning plan" },
    { id: "ration-pack", name: "Ration Pack", icon: "🧺", subtitle: "Weekly essentials" },
    { id: "water-subscription", name: "Water Subscription", icon: "🚰", subtitle: "Family refill plan" },
  ],
};

const safeText = (value, fallback) => {
  if (typeof value !== "string") {
    return fallback;
  }
  const cleaned = value.trim();
  return cleaned || fallback;
};

const sanitizePhone = (value) => String(value || "").replace(/\D/g, "");

const toSafeItem = (item, index, fallbackName) => {
  if (typeof item === "string") {
    return {
      id: `${fallbackName.toLowerCase().replace(/\s+/g, "-")}-${index}`,
      name: safeText(item, fallbackName),
      icon: "✨",
      subtitle: "",
      badge: "",
    };
  }
  if (!item || typeof item !== "object") {
    return {
      id: `${fallbackName.toLowerCase().replace(/\s+/g, "-")}-${index}`,
      name: fallbackName,
      icon: "✨",
      subtitle: "",
      badge: "",
    };
  }
  return {
    id: safeText(item.id, `${fallbackName.toLowerCase().replace(/\s+/g, "-")}-${index}`),
    name: safeText(item.name, fallbackName),
    icon: item.icon || "✨",
    subtitle: safeText(item.subtitle, ""),
    badge: safeText(item.badge, ""),
    image: typeof item.image === "string" ? item.image : "",
  };
};

const safeList = (value, fallback, fallbackName) => {
  const source = Array.isArray(value) && value.length > 0 ? value : fallback;
  return source.map((item, index) => toSafeItem(item, index, fallbackName));
};

const openWhatsApp = (message) => {
  const safeMessage = safeText(message, "Namaste, mujhe turant madad chahiye.");
  const link = getWhatsAppLink(safeMessage);
  if (link && link !== "javascript:void(0)") {
    window.open(link, "_blank", "noopener,noreferrer");
  }
};

const QuickPage = ({ data }) => {
  const navigate = useNavigate();
  const source = data && typeof data === "object" ? data : {};
  const supportPhone = sanitizePhone(source.supportPhone || DEFAULT_DATA.supportPhone);

  const pageData = useMemo(
    () => ({
      fastDelivery: safeList(source.fastDelivery, DEFAULT_DATA.fastDelivery, "Fast Delivery Item"),
      quickServices: safeList(source.quickServices, DEFAULT_DATA.quickServices, "Quick Service"),
      emergencyHelp: safeList(source.emergencyHelp, DEFAULT_DATA.emergencyHelp, "Emergency Help"),
      dailyCombos: safeList(source.dailyCombos, DEFAULT_DATA.dailyCombos, "Daily Combo"),
    }),
    [source.dailyCombos, source.emergencyHelp, source.fastDelivery, source.quickServices]
  );

  const handleCall = (topic) => {
    if (supportPhone && supportPhone.length >= 7) {
      window.location.href = `tel:${supportPhone}`;
      return;
    }
    openWhatsApp(`Namaste, mujhe ${topic} ke liye urgent call support chahiye.`);
  };

  const onFastOrder = (itemName) => {
    openWhatsApp(`Namaste, mujhe ${itemName} 10 minute delivery ke liye chahiye.`);
  };

  const onBookService = (serviceName) => {
    openWhatsApp(`Namaste, mujhe ${serviceName} service book karni hai. Please jaldi confirm karein.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="rounded-xl bg-slate-100 p-2 text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-200 active:scale-[0.96]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">Get it in 10 Minutes ⚡</h1>
            <p className="truncate text-xs font-medium text-slate-500">Fast delivery & quick services in your village</p>
          </div>
        </div>

        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            Available Now
          </span>
        </div>
      </header>

      <main className="space-y-5 px-4 py-5">
        <QuickSection title="Fast Delivery" subtitle="Daily essentials delivered quickly" tone="delivery" horizontal>
          {pageData.fastDelivery.map((item, index) => (
            <div key={item.id} className="w-[162px] flex-shrink-0 snap-start">
              <QuickCard
                title={item.name}
                subtitle="10 min slot"
                icon={item.icon}
                image={item.image}
                badge={item.badge || "Fast"}
                animateIndex={index}
                actions={[
                  {
                    label: "Order Now",
                    icon: "whatsapp",
                    variant: "primary",
                    onClick: () => onFastOrder(item.name),
                    ariaLabel: `Order ${item.name}`,
                  },
                ]}
              />
            </div>
          ))}
        </QuickSection>

        <QuickSection title="Quick Services" subtitle="Trusted people near you" tone="default">
          <div className="grid grid-cols-2 gap-3.5">
            {pageData.quickServices.map((service, index) => (
              <QuickCard
                key={service.id}
                title={service.name}
                subtitle={service.subtitle || "Available now"}
                icon={service.icon}
                image={service.image}
                animateIndex={index}
                actions={[
                  {
                    label: "Book Now",
                    icon: "whatsapp",
                    variant: "primary",
                    onClick: () => onBookService(service.name),
                    ariaLabel: `Book ${service.name}`,
                  },
                  {
                    label: "Call Now",
                    icon: "call",
                    variant: "ghost",
                    onClick: () => handleCall(service.name),
                    ariaLabel: `Call for ${service.name}`,
                  },
                ]}
              />
            ))}
          </div>
        </QuickSection>

        <QuickSection
          title="Emergency Help"
          subtitle="Reach urgent care instantly"
          tone="emergency"
          className="border border-rose-200 shadow-[0_16px_36px_rgba(225,29,72,0.14)]"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Emergency Priority
          </div>
          <div className="grid grid-cols-1 gap-3.5">
            {pageData.emergencyHelp.map((item, index) => (
              <QuickCard
                key={item.id}
                title={item.name}
                subtitle={item.subtitle || "Immediate support"}
                icon={item.icon}
                image={item.image}
                badge="Priority"
                className="ring-rose-200 shadow-[0_10px_28px_rgba(225,29,72,0.12)]"
                iconWrapClassName="bg-rose-100"
                animateIndex={index}
                actions={[
                  {
                    label: "Call Now",
                    icon: "call",
                    variant: "danger",
                    onClick: () => handleCall(item.name),
                    ariaLabel: `Emergency call for ${item.name}`,
                  },
                  {
                    label: "WhatsApp",
                    icon: "whatsapp",
                    variant: "ghost",
                    onClick: () => openWhatsApp(`Namaste, mujhe ${item.name} emergency help chahiye.`),
                    ariaLabel: `WhatsApp for ${item.name}`,
                  },
                ]}
              />
            ))}
          </div>
        </QuickSection>

        <QuickSection title="Daily Combos" subtitle="Smart packs for everyday needs" tone="combo">
          <div className="grid grid-cols-1 gap-3.5">
            {pageData.dailyCombos.map((combo, index) => (
              <QuickCard
                key={combo.id}
                title={combo.name}
                subtitle={combo.subtitle || "Best for families"}
                icon={combo.icon}
                image={combo.image}
                badge="Best Value"
                animateIndex={index}
                actions={[
                  {
                    label: "Order Now",
                    icon: "whatsapp",
                    variant: "dark",
                    onClick: () => onFastOrder(combo.name),
                    ariaLabel: `Order ${combo.name}`,
                  },
                ]}
              />
            ))}
          </div>
        </QuickSection>

        <div className="rounded-2xl bg-slate-900 px-4 py-3.5 text-center text-xs font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.35)]">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            Instant support line is active for your area
          </span>
        </div>
      </main>
    </div>
  );
};

export default QuickPage;
