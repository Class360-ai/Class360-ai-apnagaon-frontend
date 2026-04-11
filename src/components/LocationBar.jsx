import React, { useState } from "react";
import { Clock3, LocateFixed, MapPin } from "lucide-react";
import AddressSelectorModal from "./AddressSelectorModal";
import { DEFAULT_ADDRESS } from "../utils/locationHelpers";

const LocationBar = ({ compact = false, intelligence: providedIntelligence, onLocationChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const intelligence = providedIntelligence || {
    address: DEFAULT_ADDRESS,
    location: { name: DEFAULT_ADDRESS.area, lat: DEFAULT_ADDRESS.lat, lon: DEFAULT_ADDRESS.lon },
    status: "ready",
    message: "",
    loading: false,
    deliveryEstimate: "10 min",
    requestCurrentLocation: () => {},
    confirmPickedLocation: async () => {},
    saveAddress: () => {},
  };
  const { address, location, status, message, loading, deliveryEstimate, requestCurrentLocation, confirmPickedLocation, saveAddress } = intelligence;

  const saveManualAddress = (nextAddress) => {
    saveAddress(nextAddress);
    setPickerOpen(false);
    onLocationChange?.(nextAddress);
  };

  return (
    <>
      <section
        className={`rounded-[24px] bg-white/95 p-3 shadow-sm ring-1 ring-emerald-100 transition ${
          compact ? "space-y-2" : "space-y-3"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-black text-slate-950">
              <MapPin className="h-4 w-4 flex-shrink-0 text-orange-500" />
              <span className="truncate">Deliver to: {loading ? "Detecting..." : location.name}</span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{loading ? message || "Detecting your location..." : `Delivery in ${deliveryEstimate}`}</span>
            </p>
            {status === "denied" ? <p className="mt-1 text-xs font-bold text-orange-600">Enable location for better service</p> : null}
          </div>
          {loading ? <span className="h-9 w-9 animate-pulse rounded-2xl bg-emerald-100" aria-hidden="true" /> : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={requestCurrentLocation}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-3 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-100 disabled:bg-emerald-300"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            <span>{loading ? "Detecting..." : "Use Current Location"}</span>
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={loading}
            className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-black text-orange-700 disabled:opacity-60"
          >
            Change
          </button>
        </div>
      </section>

      <AddressSelectorModal
        open={pickerOpen}
        selectedAddress={address}
        loading={loading}
        onClose={() => setPickerOpen(false)}
        onUseCurrentLocation={requestCurrentLocation}
        onPickLocation={confirmPickedLocation}
        onSaveAddress={saveManualAddress}
      />
    </>
  );
};

export default LocationBar;
