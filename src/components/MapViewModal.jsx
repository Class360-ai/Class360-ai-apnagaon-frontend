import React from "react";
import { ExternalLink, X } from "lucide-react";
import { openDirections } from "../utils/locationHelpers";

const MapViewModal = ({ open, title = "Map", target, origin, onClose }) => {
  if (!open || !target) return null;

  const lat = Number(target.lat);
  const lon = Number(target.lon);
  const bbox = `${lon - 0.02}%2C${lat - 0.02}%2C${lon + 0.02}%2C${lat + 0.02}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-slate-950/55 px-3 pb-3 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[28px] bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            <p className="text-xs font-semibold text-slate-500">{target.address || target.area || "Open directions for this location"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600" aria-label="Close map">
            <X className="h-4 w-4" />
          </button>
        </div>
        <iframe title={title} src={src} className="h-80 w-full rounded-[24px] border-0 ring-1 ring-slate-200" />
        <button
          type="button"
          onClick={() => openDirections(target, origin)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Get Directions</span>
        </button>
      </section>
    </div>
  );
};

export default MapViewModal;
