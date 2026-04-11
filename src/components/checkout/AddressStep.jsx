import React, { useEffect, useMemo, useState } from "react";
import { Map, Navigation, PlusCircle, Sparkles } from "lucide-react";
import AddressCard from "./AddressCard";
import MapPicker from "../MapPicker";
import {
  LOCATION_UPDATED_EVENT,
  createAddressId,
  getSavedAddresses,
  normalizeAddress,
} from "../../utils/locationHelpers";
import { loadAddressesWithFallback, saveAddressWithFallback } from "../../utils/backendAddressHelpers";

const defaultForm = {
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

const text = {
  en: {
    title: "Address",
    subtitle: "Step 1 of 3",
    savedTitle: "Saved addresses",
    empty: "No saved address yet. Add one to continue faster next time.",
    quickTitle: "Quick actions",
    current: "Use Current Location",
    map: "Pick on Map",
    manual: "Add Address Manually",
    manualTitle: "Add a new address",
    save: "Save Address",
    continue: "Continue to Summary",
    continueDisabled: "Select or save an address first",
    selected: "Selected",
    select: "Select",
    edit: "Edit",
    info: "100% Secure • Fast village delivery • WhatsApp support available",
    denied: "Location permission denied. Manual address still works perfectly.",
    error: "Please fill the required fields.",
    mapComingSoon: "Map picker opens here. Full map flow can be connected anytime.",
    deliveringTo: "Delivering to",
    locationLoading: "Detecting...",
    locationReady: "Use Current Location",
    saving: "Saving...",
  },
  hi: {
    title: "पता",
    subtitle: "चरण 1 में से 3",
    savedTitle: "सहेजे गए पते",
    empty: "अभी कोई पता नहीं है। आगे तेज़ checkout के लिए एक जोड़ें।",
    quickTitle: "त्वरित विकल्प",
    current: "वर्तमान स्थान",
    map: "मैप पर चुनें",
    manual: "खुद पता भरें",
    manualTitle: "नया पता जोड़ें",
    save: "पता सहेजें",
    continue: "सारांश पर जाएँ",
    continueDisabled: "पहले पता चुनें या सहेजें",
    selected: "चुना गया",
    select: "चुनें",
    edit: "बदलें",
    info: "100% सुरक्षित • तेज़ गाँव डिलीवरी • WhatsApp सहायता उपलब्ध",
    denied: "Location permission नहीं मिला। Manual address अभी भी काम करेगा।",
    error: "कृपया ज़रूरी fields भरें।",
    mapComingSoon: "Map picker यहीं खुलेगा। Full map flow कभी भी जोड़ा जा सकता है।",
    deliveringTo: "डिलीवरी जाएगी",
    locationLoading: "जाँचा जा रहा है...",
    locationReady: "वर्तमान स्थान",
    saving: "सहेजा जा रहा है...",
  },
};

const requiredFields = ["fullName", "phone", "house", "area", "city", "state", "pincode"];

const AddressStep = ({ lang = "en", locationIntelligence, onContinue }) => {
  const copy = text[lang] || text.en;
  const [savedAddresses, setSavedAddresses] = useState(() => getSavedAddresses());
  const [showManualForm, setShowManualForm] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedAddress = locationIntelligence.address;
  const hasSelectedAddress = Boolean(selectedAddress?.id && selectedAddress.source !== "default");

  const selectedCount = useMemo(() => savedAddresses.length, [savedAddresses.length]);

  useEffect(() => {
    const sync = async () => {
      const addresses = await loadAddressesWithFallback();
      setSavedAddresses(addresses);
    };

    sync();

    const onStorage = () => setSavedAddresses(getSavedAddresses());
    window.addEventListener(LOCATION_UPDATED_EVENT, onStorage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, onStorage);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: false, submit: false }));
  };

  const validateForm = () => {
    const nextErrors = {};
    requiredFields.forEach((field) => {
      if (!String(form[field] || "").trim()) nextErrors[field] = true;
    });
    if (String(form.phone || "").replace(/\D/g, "").length < 10) nextErrors.phone = true;
    if (String(form.pincode || "").replace(/\D/g, "").length < 6) nextErrors.pincode = true;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const persistSelected = (address) => {
    const normalized = locationIntelligence.saveAddress(address);
    setSavedAddresses(getSavedAddresses());
    return normalized;
  };

  const saveManual = async () => {
    if (!validateForm()) {
      setErrors((current) => ({ ...current, submit: true }));
      return null;
    }

    setSaving(true);
    const normalized = normalizeAddress({
      ...form,
      id: createAddressId(),
      source: "manual",
      lat: null,
      lon: null,
    });

    persistSelected(normalized);
    setSavedAddresses((current) => [normalized, ...current.filter((item) => item.id !== normalized.id)]);

    const saved = await saveAddressWithFallback(normalized);
    const finalAddress = normalizeAddress({ ...(saved || normalized), id: (saved || normalized).id || (saved || normalized)._id });
    persistSelected(finalAddress);
    setSavedAddresses((current) => [finalAddress, ...current.filter((item) => item.id !== finalAddress.id)]);

    setShowManualForm(false);
    setSaving(false);
    return finalAddress;
  };

  const requestCurrentLocation = async () => {
    const next = await locationIntelligence.requestCurrentLocation();
    if (next) {
      persistSelected(next);
      setSavedAddresses((current) => [next, ...current.filter((item) => item.id !== next.id)]);
    }
  };

  const continueSafely = () => {
    if (!hasSelectedAddress) {
      setShowManualForm(true);
      return;
    }
    onContinue?.();
  };

  return (
    <div className="space-y-4 pb-28">
      <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-4 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">{copy.subtitle}</p>
          <h1 className="mt-1 text-3xl font-black">{copy.title}</h1>
          <p className="mt-2 text-sm font-semibold text-white/90">{copy.info}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 text-center">
          <div className="rounded-[18px] bg-emerald-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">{lang === "hi" ? "सुरक्षित" : "Secure"}</p>
          </div>
          <div className="rounded-[18px] bg-orange-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-orange-700">{lang === "hi" ? "तेज़ डिलीवरी" : "Fast Delivery"}</p>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-700">{lang === "hi" ? "WhatsApp सहायता" : "WhatsApp Help"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">{copy.savedTitle}</h2>
            <p className="text-xs font-semibold text-slate-500">
              {selectedCount ? `${selectedCount} ${lang === "hi" ? "पते सहेजे गए हैं" : "addresses saved"}` : copy.empty}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">{copy.selected}</span>
        </div>

        <div className="mt-3 space-y-3">
          {!savedAddresses.length && !hasSelectedAddress ? (
            <div className="rounded-[20px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">
              {copy.empty}
            </div>
          ) : null}

          {[selectedAddress, ...savedAddresses.filter((item) => item.id !== selectedAddress?.id)].filter(Boolean).map((address) => (
            <AddressCard
              lang={lang}
              key={address.id}
              address={address}
              selected={address.id === selectedAddress?.id && address.source !== "default"}
              actionLabel={address.id === selectedAddress?.id && address.source !== "default" ? copy.selected : copy.select}
              onSelect={() => persistSelected(address)}
              onAction={() => persistSelected(address)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-black text-slate-950">{copy.quickTitle}</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">{lang === "hi" ? "अपने लिए सबसे आसान तरीका चुनें" : "Pick the quickest way to set your delivery address."}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={requestCurrentLocation}
            className="rounded-[20px] bg-emerald-600 px-3 py-3 text-xs font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
            disabled={locationIntelligence.loading}
          >
            <Navigation className="mx-auto mb-1 h-4 w-4" />
            {locationIntelligence.loading ? copy.locationLoading : copy.current}
          </button>
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="rounded-[20px] bg-orange-50 px-3 py-3 text-xs font-black text-orange-700 ring-1 ring-orange-200"
          >
            <Map className="mx-auto mb-1 h-4 w-4" />
            {copy.map}
          </button>
          <button
            type="button"
            onClick={() => setShowManualForm((value) => !value)}
            className="rounded-[20px] bg-white px-3 py-3 text-xs font-black text-slate-700 ring-1 ring-slate-200"
          >
            <PlusCircle className="mx-auto mb-1 h-4 w-4" />
            {copy.manual}
          </button>
        </div>
      </section>

      {locationIntelligence.status === "denied" ? (
        <p className="rounded-2xl bg-orange-50 p-3 text-xs font-bold text-orange-700">{copy.denied}</p>
      ) : null}

      {showManualForm ? (
        <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">{copy.manualTitle}</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">{lang === "hi" ? "पता भरें और उसे checkout के लिए save करें" : "Fill the address once and save it for checkout."}</p>
            </div>
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-3 grid gap-2">
            {[
              ["fullName", "Full Name"],
              ["phone", "Phone Number"],
              ["house", "House / Flat / Landmark"],
              ["area", "Area / Village"],
              ["city", "City / District"],
              ["state", "State"],
              ["pincode", "Pincode"],
            ].map(([key, placeholder]) => (
              <div key={key} className="space-y-1">
                <input
                  value={form[key]}
                  onChange={(event) => update(key, event.target.value)}
                  placeholder={placeholder}
                  className={`w-full rounded-2xl border px-3 py-3 text-sm outline-none transition ${
                    errors[key] ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                  }`}
                  type={key === "phone" || key === "pincode" ? "tel" : "text"}
                />
                {errors[key] ? (
                  <p className="text-[11px] font-bold text-red-500">{lang === "hi" ? "यह field ज़रूरी है" : "This field is required"}</p>
                ) : null}
              </div>
            ))}
            <select
              value={form.label}
              onChange={(event) => update("label", event.target.value)}
              className="rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none"
            >
              <option>Home</option>
              <option>Work</option>
              <option>Other</option>
            </select>
            <textarea
              value={form.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder={lang === "hi" ? "Delivery note (optional)" : "Delivery note (optional)"}
              rows={3}
              className="rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none"
            />
          </div>
          {errors.submit ? <p className="mt-2 text-xs font-bold text-red-500">{copy.error}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={saveManual}
              disabled={saving}
              className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-200 disabled:bg-slate-400"
            >
              {saving ? copy.saving : copy.save}
            </button>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
            >
              {lang === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </section>
      ) : null}

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-100 bg-white/95 p-4 shadow-[0_-12px_34px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{copy.deliveringTo}</p>
            <p className="truncate text-sm font-black text-slate-950">
              {hasSelectedAddress ? selectedAddress.label || selectedAddress.area || selectedAddress.city || (lang === "hi" ? "सहेजा गया पता" : "Saved address") : copy.continueDisabled}
            </p>
          </div>
          <button
            type="button"
            onClick={continueSafely}
            disabled={!hasSelectedAddress}
            className="rounded-full bg-emerald-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
          >
            {copy.continue}
          </button>
        </div>
      </div>

      <MapPicker
        open={mapOpen}
        location={selectedAddress}
        loading={locationIntelligence.loading}
        onClose={() => setMapOpen(false)}
        onConfirm={async (point) => {
          const saved = await locationIntelligence.confirmPickedLocation(point);
          if (saved) {
            persistSelected(saved);
            setSavedAddresses((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
          }
          setMapOpen(false);
        }}
      />
    </div>
  );
};

export default AddressStep;
