import React from "react";
import { MessageCircle, Phone } from "lucide-react";
import { getWhatsAppLink } from "../utils/whatsappUtils";
import { getSupportPhone } from "../utils/runtimeConfig";

const SupportActions = ({ message = "Namaste, mujhe ApnaGaon order support chahiye.", compact = false }) => {
  const openSupport = () => {
    const link = getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") window.open(link, "_blank", "noopener,noreferrer");
  };

  const callSupport = () => {
    window.location.href = `tel:${getSupportPhone()}`;
  };

  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-3"}>
      <button type="button" onClick={openSupport} className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white">
        <MessageCircle className="h-4 w-4" />
        WhatsApp Support
      </button>
      <button type="button" onClick={callSupport} className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-100">
        <Phone className="h-4 w-4 text-orange-600" />
        Call Support
      </button>
    </div>
  );
};

export default SupportActions;
