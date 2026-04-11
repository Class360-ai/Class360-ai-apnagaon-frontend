import React, { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { DEFAULT_LOCATION } from "../utils/locationHelper";

const MapPicker = ({ open, location = DEFAULT_LOCATION, loading = false, onClose, onConfirm }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [point, setPoint] = useState(() => ({
    lat: Number(location?.lat) || DEFAULT_LOCATION.lat,
    lon: Number(location?.lon) || DEFAULT_LOCATION.lon,
  }));

  const bbox = useMemo(() => {
    const lat = Number(point.lat) || DEFAULT_LOCATION.lat;
    const lon = Number(point.lon) || DEFAULT_LOCATION.lon;
    return {
      left: lon - 0.03,
      right: lon + 0.03,
      bottom: lat - 0.03,
      top: lat + 0.03,
    };
  }, [point.lat, point.lon]);

  useEffect(() => {
    if (!open) return undefined;
    if (window.L) {
      const readyTimer = window.setTimeout(() => setLeafletReady(true), 0);
      return () => window.clearTimeout(readyTimer);
    }

    const cssId = "leaflet-css";
    const scriptId = "leaflet-js";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", () => setLeafletReady(Boolean(window.L)), { once: true });
      return undefined;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletReady(Boolean(window.L));
    script.onerror = () => setLeafletReady(false);
    document.body.appendChild(script);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !leafletReady || !mapRef.current || !window.L) return undefined;

    if (!leafletMapRef.current) {
      leafletMapRef.current = window.L.map(mapRef.current).setView([point.lat, point.lon], 15);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMapRef.current);
      markerRef.current = window.L.marker([point.lat, point.lon], { draggable: true }).addTo(leafletMapRef.current);
      markerRef.current.on("dragend", () => {
        const next = markerRef.current.getLatLng();
        setPoint({ lat: next.lat, lon: next.lng });
      });
      leafletMapRef.current.on("click", (event) => {
        markerRef.current.setLatLng(event.latlng);
        setPoint({ lat: event.latlng.lat, lon: event.latlng.lng });
      });
    } else {
      leafletMapRef.current.invalidateSize();
      leafletMapRef.current.setView([point.lat, point.lon], 15);
      markerRef.current?.setLatLng([point.lat, point.lon]);
    }

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, [leafletReady, open, point.lat, point.lon]);

  if (!open) return null;

  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.left}%2C${bbox.bottom}%2C${bbox.right}%2C${bbox.top}&layer=mapnik&marker=${point.lat}%2C${point.lon}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 px-3 pb-3 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[28px] bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">Pick delivery point</h2>
            <p className="text-xs font-semibold text-slate-500">Drag or tap the map to adjust your location.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600" aria-label="Close map picker">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={mapRef}
          className="relative h-80 overflow-hidden rounded-[24px] bg-emerald-50 ring-1 ring-slate-200"
        >
          {!leafletReady ? <iframe title="OpenStreetMap location picker" src={iframeSrc} className="h-full w-full border-0" /> : null}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm">
            {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onConfirm(point)}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
        >
          {loading ? "Fetching location..." : "Confirm Location"}
        </button>
      </section>
    </div>
  );
};

export default MapPicker;
