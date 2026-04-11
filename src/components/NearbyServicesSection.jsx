import React, { useEffect, useState } from "react";
import { ExternalLink, Phone, Wrench } from "lucide-react";
import MapViewModal from "./MapViewModal";
import { getNearbyEntries, mockServices, openDirections } from "../utils/locationHelpers";
import { safeFetch, servicePartnersAPI, servicesAPI } from "../utils/api";
import { getWhatsAppLink } from "../utils/whatsappUtils";

const NearbyServicesSection = ({ address }) => {
  const [services, setServices] = useState(() => getNearbyEntries(address, mockServices, 10));
  const [mapTarget, setMapTarget] = useState(null);
  const approximate = !Number.isFinite(Number(address?.lat)) || !Number.isFinite(Number(address?.lon));

  useEffect(() => {
    const load = async () => {
      const hasCoords = Number.isFinite(Number(address?.lat)) && Number.isFinite(Number(address?.lon));
      const data = hasCoords
        ? await safeFetch(() => servicesAPI.getNearby(address.lat, address.lon, 10), null)
        : await safeFetch(() => servicesAPI.getAll(), null);
      const approvedPartners = await safeFetch(() => servicePartnersAPI.approved(), []);
      const partnerServices = Array.isArray(approvedPartners)
        ? approvedPartners.map((partner) => ({ ...partner, available: partner.status === "approved" }))
        : [];
      const merged = [...(Array.isArray(data) ? data : []), ...partnerServices];
      setServices(merged.length ? getNearbyEntries(address, merged, 10) : getNearbyEntries(address, mockServices, 10));
    };
    load();
  }, [address]);

  if (!services.length) return null;

  const bookOnWhatsApp = (service) => {
    const link = getWhatsAppLink(`Namaste, mujhe ${service.name} (${service.serviceType || service.category || "service"}) book karna hai.`);
    if (link && link !== "javascript:void(0)") window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-base font-black text-slate-950">Nearby Services</h2>
        <p className="text-xs font-semibold text-slate-500">
          {approximate ? "Nearby results are approximate for manual address" : "Available around your location"}
        </p>
      </div>
      <div className="grid gap-2">
        {services.slice(0, 4).map((service) => (
          <article key={service.id || service._id || service.name} className="rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Wrench className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-950">{service.name}</h3>
                    <p className="text-xs font-semibold capitalize text-slate-500">{service.serviceType || service.category}</p>
                  </div>
                  <span className="text-xs font-black text-orange-600">
                    {Number.isFinite(service.distanceKm) ? `${service.distanceKm.toFixed(1)} km` : "Approx"}
                  </span>
                </div>
                <p className="mt-1 text-xs font-black text-orange-600">ETA {service.eta || service.etaMinutes ? `${service.eta || service.etaMinutes} min` : "45 min"}</p>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => service.phone && (window.location.href = `tel:${service.phone}`)} className="rounded-full bg-slate-100 px-2 py-2 text-xs font-black text-slate-700">
                    <Phone className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => setMapTarget(service)} className="rounded-full bg-slate-100 px-2 py-2 text-xs font-black text-slate-700">Map</button>
                  <button type="button" onClick={() => openDirections(service, address)} className="flex items-center justify-center gap-1 rounded-full bg-orange-50 px-2 py-2 text-xs font-black text-orange-700">
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => bookOnWhatsApp(service)} className="rounded-full bg-emerald-600 px-2 py-2 text-xs font-black text-white">Book</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <MapViewModal open={Boolean(mapTarget)} target={mapTarget} origin={address} title={mapTarget?.name} onClose={() => setMapTarget(null)} />
    </section>
  );
};

export default NearbyServicesSection;
