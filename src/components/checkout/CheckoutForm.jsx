import React from "react";
import { AlertTriangle, BriefcaseBusiness, Home, Layers3, MapPin, Navigation, Phone, UserRound } from "lucide-react";

const fields = [
  {
    key: "fullName",
    label: "Full Name",
    placeholder: "Enter customer name",
    icon: UserRound,
    type: "text",
  },
  {
    key: "phone",
    label: "Phone Number",
    placeholder: "10 digit mobile number",
    icon: Phone,
    type: "tel",
    inputMode: "tel",
  },
  {
    key: "address",
    label: "Village / Full Address",
    placeholder: "Village, house, street, area",
    icon: MapPin,
    type: "text",
  },
  {
    key: "landmark",
    label: "Landmark",
    placeholder: "Near school, temple, shop, etc.",
    icon: MapPin,
    type: "text",
  },
];

const addressTypes = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: BriefcaseBusiness },
  { id: "other", label: "Other", icon: Layers3 },
];

const inputClass =
  "w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

const CheckoutForm = ({
  form,
  errors,
  touched = {},
  onChange,
  onBlur,
  onUseCurrentLocation,
  onChangeAddress,
  addressType = "home",
  onAddressTypeChange,
  locationState = {},
  showErrors = false,
  submitError,
}) => {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery address</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Where should we deliver?</h2>
        </div>
      </div>

      {submitError ? (
        <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {addressTypes.map((type) => {
          const Icon = type.icon;
          const selected = addressType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onAddressTypeChange?.(type.id)}
              className={`flex items-center justify-center gap-2 rounded-[16px] px-3 py-3 text-xs font-black transition ${
                selected ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700 ring-1 ring-slate-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {type.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4">
        {fields.map((field) => {
          const Icon = field.icon;
          const hasError = Boolean(errors?.[field.key]);
          const shouldShowError = showErrors || touched?.[field.key];
          return (
            <label key={field.key} className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                <Icon className="h-3.5 w-3.5 text-emerald-600" />
                <span>{field.label}</span>
                {field.key === "landmark" ? (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">Optional</span>
                ) : (
                  <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-orange-700">Required</span>
                )}
              </span>
              <input
                type={field.type}
                inputMode={field.inputMode}
                value={form?.[field.key] || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                onBlur={() => onBlur?.(field.key)}
                placeholder={field.placeholder}
                className={`${inputClass} ${hasError ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {shouldShowError && hasError ? <p className="mt-2 text-xs font-bold text-red-500">{errors[field.key]}</p> : null}

              {field.key === "address" ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={onUseCurrentLocation}
                    disabled={Boolean(locationState.loading)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 disabled:opacity-70"
                  >
                    <Navigation className="h-4 w-4" />
                    {locationState.loading ? "Fetching your location..." : "Tap to Auto Fill Location"}
                  </button>
                  <button
                    type="button"
                    onClick={onChangeAddress}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-slate-50 px-4 py-3 text-sm font-black text-slate-800 ring-1 ring-slate-100"
                  >
                    Change Address
                  </button>
                  {locationState.latitude && locationState.longitude ? (
                    <div className="rounded-[16px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
                      <p className="font-black text-slate-900">Location selected successfully</p>
                      <p className="mt-1 text-emerald-700">Current location added</p>
                      <p className="mt-1">
                        Lat: {Number(locationState.latitude).toFixed(5)} | Lng: {Number(locationState.longitude).toFixed(5)}
                      </p>
                      <p className="mt-1">Source: {locationState.locationSource === "gps" ? "GPS" : "Manual"}</p>
                    </div>
                  ) : null}
                  {locationState.message ? <p className="text-xs font-semibold text-slate-500">{locationState.message}</p> : null}
                </div>
              ) : null}
            </label>
          );
        })}

      </div>
    </section>
  );
};

export default CheckoutForm;
