import React from "react";
import { Phone, Bike, MapPin } from "lucide-react";

const DeliveryPartnerList = ({ partners = [], selectedId = "", onSelect }) => (
  <div className="space-y-2">
    {partners.length ? (
      partners.map((partner) => {
        const active = String(selectedId) === String(partner.id);
        return (
          <button
            key={partner.id}
            type="button"
            onClick={() => onSelect?.(partner)}
            className={`w-full rounded-[24px] px-4 py-3 text-left ring-1 transition ${
              active ? "bg-emerald-50 text-emerald-950 ring-emerald-200" : "bg-slate-50 text-slate-800 ring-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black">{partner.name}</p>
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                  {partner.phone || "Phone not available"}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {partner.area || "Area not set"}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${partner.available ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                {partner.available ? "Available" : "Busy"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-500">
              <Bike className="h-4 w-4" />
              {partner.vehicleType || "Bike"} · {partner.activeOrdersCount || 0} active
            </div>
          </button>
        );
      })
    ) : (
      <div className="rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-500 ring-1 ring-slate-100">No delivery partners found.</div>
    )}
  </div>
);

export default DeliveryPartnerList;
