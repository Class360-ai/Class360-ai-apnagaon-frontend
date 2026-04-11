import React from "react";
import { MessageCircle, Phone, Trash2, Wrench } from "lucide-react";

const ServiceCartCard = ({ service, onRemove, onWhatsApp, onCall }) => {
  return (
    <article className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Wrench className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-slate-950">{service.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{service.subtitle}</p>
            </div>
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(service.id)}
                className="rounded-full bg-slate-50 p-2 text-slate-400"
                aria-label={`Remove ${service.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
              {service.status || "Inquiry"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onWhatsApp(service)}
                className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => onCall(service)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 text-orange-600"
                aria-label={`Call for ${service.name}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ServiceCartCard;
