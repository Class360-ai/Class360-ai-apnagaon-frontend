import React from "react";
import { MapPin } from "lucide-react";
import { formatAddressLine } from "../../utils/locationHelpers";

const copy = {
  en: { selected: "Selected", defaultName: "ApnaGaon Customer" },
  hi: { selected: "चुना गया", defaultName: "ApnaGaon ग्राहक" },
};

const AddressCard = ({ lang = "en", address, selected = false, onSelect, actionLabel = "Select", onAction }) => {
  const text = copy[lang] || copy.en;
  if (!address) return null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[24px] border p-4 text-left shadow-sm transition ${
        selected ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-slate-950">{address.label || "Home"}</h3>
            {selected ? <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">{text.selected}</span> : null}
          </div>
          <p className="mt-1 text-sm font-bold text-slate-700">{address.fullName || address.area || text.defaultName}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{formatAddressLine(address)}</p>
          {address.phone ? <p className="mt-1 text-xs font-bold text-slate-500">{address.phone}</p> : null}
          {onAction ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onAction(address);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") onAction(address);
              }}
              className="mt-3 inline-flex rounded-full bg-white px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
            >
              {actionLabel}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export default AddressCard;
