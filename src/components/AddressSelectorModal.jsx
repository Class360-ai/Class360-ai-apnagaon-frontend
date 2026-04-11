import React, { useState } from "react";
import { LocateFixed, Map, X } from "lucide-react";
import MapPicker from "./MapPicker";
import { createAddressId, DEFAULT_ADDRESS, normalizeAddress } from "../utils/locationHelpers";

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  house: "",
  area: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: "",
  note: "",
};

const AddressSelectorModal = ({
  open,
  selectedAddress = DEFAULT_ADDRESS,
  loading = false,
  onClose,
  onUseCurrentLocation,
  onPickLocation,
  onSaveAddress,
}) => {
  const [mapOpen, setMapOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    fullName: selectedAddress?.fullName || "",
    phone: selectedAddress?.phone || "",
    house: selectedAddress?.house || "",
    area: selectedAddress?.area || "",
    city: selectedAddress?.city || "",
    state: selectedAddress?.state || "Uttar Pradesh",
    pincode: selectedAddress?.pincode || "",
    note: selectedAddress?.note || "",
  }));
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: false }));
  };

  const submitManual = () => {
    const nextErrors = {};
    ["fullName", "phone", "house", "area", "city", "state", "pincode"].forEach((key) => {
      if (!String(form[key] || "").trim()) nextErrors[key] = true;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSaveAddress?.(
      normalizeAddress({
        ...form,
        id: selectedAddress?.id || createAddressId(),
        lat: null,
        lon: null,
        source: "manual",
      })
    );
    onClose?.();
  };

  const confirmPickedPoint = async (point) => {
    await onPickLocation?.(point);
    setMapOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-slate-950/55 px-3 pb-3 backdrop-blur-sm">
      <section className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Select delivery address</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">Use GPS, pick on map, or save a manual address.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600" aria-label="Close address selector">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={onUseCurrentLocation}
            className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-3 py-3 text-xs font-black text-white disabled:bg-emerald-300"
          >
            <LocateFixed className="h-4 w-4" />
            <span>{loading ? "Detecting..." : "Use Current Location"}</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setMapOpen(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-orange-50 px-3 py-3 text-xs font-black text-orange-700 ring-1 ring-orange-200"
          >
            <Map className="h-4 w-4" />
            <span>Pick on Map</span>
          </button>
        </div>

        <div className="mt-5 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100">
          <h3 className="mb-3 text-sm font-black text-slate-950">Enter Address Manually</h3>
          <div className="grid gap-2">
            {[
              ["fullName", "Full Name"],
              ["phone", "Phone Number"],
              ["house", "House / Flat / Landmark"],
              ["area", "Area / Village"],
              ["city", "City / District"],
              ["state", "State"],
              ["pincode", "Pincode"],
            ].map(([key, placeholder]) => (
              <input
                key={key}
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
                placeholder={placeholder}
                className={`rounded-2xl border bg-white px-3 py-3 text-sm outline-none focus:border-emerald-400 ${
                  errors[key] ? "border-red-400" : "border-slate-200"
                }`}
                type={key === "phone" || key === "pincode" ? "tel" : "text"}
              />
            ))}
            <textarea
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Delivery Note (optional)"
              rows={3}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <button type="button" onClick={submitManual} className="mt-3 w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white">
            Save Address
          </button>
        </div>
      </section>

      <MapPicker
        open={mapOpen}
        location={selectedAddress}
        loading={loading}
        onClose={() => setMapOpen(false)}
        onConfirm={confirmPickedPoint}
      />
    </div>
  );
};

export default AddressSelectorModal;
