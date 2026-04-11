import React, { useEffect, useState } from "react";
import { ExternalLink, MapPin, Store } from "lucide-react";
import MapViewModal from "./MapViewModal";
import { getNearbyEntries, mockShops, openDirections } from "../utils/locationHelpers";
import { partnersAPI, shopsAPI, safeFetch } from "../utils/api";

const NearbyShopsSection = ({ address, onOrderNow }) => {
  const [shops, setShops] = useState(() => getNearbyEntries(address, mockShops, 10));
  const [mapTarget, setMapTarget] = useState(null);
  const approximate = !Number.isFinite(Number(address?.lat)) || !Number.isFinite(Number(address?.lon));

  useEffect(() => {
    const load = async () => {
      const hasCoords = Number.isFinite(Number(address?.lat)) && Number.isFinite(Number(address?.lon));
      const data = hasCoords
        ? await safeFetch(() => shopsAPI.getNearby(address.lat, address.lon, 10), null)
        : await safeFetch(() => shopsAPI.getAll(), null);
      const approvedPartners = await safeFetch(() => partnersAPI.approved(), []);
      const partnerShops = Array.isArray(approvedPartners)
        ? approvedPartners.map((partner) => ({ ...partner, name: partner.shopName, available: partner.status === "approved" }))
        : [];
      const merged = [...(Array.isArray(data) ? data : []), ...partnerShops];
      setShops(merged.length ? getNearbyEntries(address, merged, 10) : getNearbyEntries(address, mockShops, 10));
    };
    load();
  }, [address]);

  if (!shops.length) return null;

  return (
    <section className="space-y-3">
      <div className="px-1">
        <h2 className="text-base font-black text-slate-950">Nearby Shops</h2>
        <p className="text-xs font-semibold text-slate-500">
          {approximate ? "Nearby results are approximate for manual address" : "Sorted by closest first"}
        </p>
      </div>
      <div className="grid gap-2">
        {shops.slice(0, 4).map((shop) => (
          <article key={shop.id || shop._id || shop.name} className="rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Store className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-950">{shop.name}</h3>
                    <p className="text-xs font-semibold capitalize text-slate-500">{shop.category}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-700">
                    {Number.isFinite(shop.distanceKm) ? `${shop.distanceKm.toFixed(1)} km` : "Approx"}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-500">{shop.address || [shop.area, shop.city].filter(Boolean).join(", ")}</p>
                <p className="mt-1 text-xs font-black text-orange-600">ETA {shop.eta || shop.etaMinutes ? `${shop.eta || shop.etaMinutes} min` : "45 min"}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setMapTarget(shop)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
                    Map
                  </button>
                  <button type="button" onClick={() => openDirections(shop, address)} className="flex items-center justify-center gap-1 rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">
                    <ExternalLink className="h-3 w-3" /> Directions
                  </button>
                  <button type="button" onClick={() => onOrderNow?.(shop)} className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-black text-white">
                    Order
                  </button>
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

export default NearbyShopsSection;
