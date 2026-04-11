import React, { useMemo, useState } from "react";
import { UploadCloud, MapPin, Clock3 } from "lucide-react";

const initialState = {
  shopName: "",
  ownerName: "",
  phone: "",
  whatsapp: "",
  category: "grocery",
  area: "",
  address: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: "",
  deliveryAvailable: true,
  upiId: "",
  description: "",
  openingTime: "",
  closingTime: "",
  logo: "",
  idProof: "",
  addressProof: "",
  lat: "",
  lon: "",
};

const requiredFields = ["shopName", "ownerName", "phone", "whatsapp", "category", "area", "address", "city", "state", "pincode"];

const inputClass =
  "w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500";

const labels = {
  shopName: "Shop Name",
  ownerName: "Owner Name",
  phone: "Mobile Number",
  whatsapp: "WhatsApp Number",
  category: "Category",
  area: "Village / Area",
  address: "Full Address",
  city: "City / District",
  state: "State",
  pincode: "Pincode",
  deliveryAvailable: "Delivery Available",
  upiId: "UPI ID",
  description: "Shop Description",
  openingTime: "Opening Time",
  closingTime: "Closing Time",
  logo: "Shop Photo / Logo",
  idProof: "ID Proof",
  addressProof: "Address Proof",
  lat: "Latitude",
  lon: "Longitude",
};

const categoryOptions = [
  ["grocery", "Grocery"],
  ["dairy", "Dairy"],
  ["vegetables", "Vegetables"],
  ["fruits", "Fruits"],
  ["medical", "Medical"],
  ["bakery", "Bakery"],
  ["stationery", "Stationery"],
  ["other", "Other"],
];

const ShopApplicationForm = ({ onSubmit, submitLabel = "Submit Application", initialValues = {} }) => {
  const [form, setForm] = useState({ ...initialState, ...initialValues });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    requiredFields.forEach((field) => {
      if (!String(form[field] || "").trim()) next[field] = "Required";
    });
    if (form.lat && Number.isNaN(Number(form.lat))) next.lat = "Latitude must be numeric";
    if (form.lon && Number.isNaN(Number(form.lon))) next.lon = "Longitude must be numeric";
    setErrors(next);
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    await onSubmit?.({
      ...form,
      lat: form.lat === "" ? null : Number(form.lat),
      lon: form.lon === "" ? null : Number(form.lon),
      deliveryAvailable: Boolean(form.deliveryAvailable),
    });
    setLoading(false);
  };

  const sections = useMemo(
    () => [
      [
        ["shopName", "ownerName"],
        ["phone", "whatsapp"],
        ["category", "area"],
        ["address", "city"],
        ["state", "pincode"],
        ["upiId", "description"],
        ["openingTime", "closingTime"],
        ["logo", "idProof"],
        ["addressProof", "lat"],
        ["lon"],
      ],
      [],
    ],
    []
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {sections[0].flat().map((field) => {
          if (field === "deliveryAvailable") return null;
          if (field === "description") {
            return (
              <div key={field} className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">{labels[field]}</label>
                <textarea
                  rows={4}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`}
                  placeholder="Tell customers about your shop, products, and delivery service"
                />
                {errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field]}</p> : null}
              </div>
            );
          }
          if (field === "category") {
            return (
              <div key={field}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{labels[field]}</label>
                <select
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`}
                >
                  {categoryOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field]}</p> : null}
              </div>
            );
          }
          if (field === "logo" || field === "idProof" || field === "addressProof") {
            return (
              <div key={field}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{labels[field]}</label>
                <div className="flex items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                  <UploadCloud className="h-5 w-5 text-emerald-600" />
                  <input
                    value={form[field]}
                    onChange={(e) => update(field, e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                    placeholder="Paste a link or type placeholder"
                  />
                </div>
                {errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field]}</p> : null}
              </div>
            );
          }
          if (field === "openingTime" || field === "closingTime") {
            return (
              <div key={field}>
                <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-emerald-600" />
                  {labels[field]}
                </label>
                <input
                  type="time"
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`}
                />
                {errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field]}</p> : null}
              </div>
            );
          }
          if (field === "lat" || field === "lon") {
            return (
              <div key={field}>
                <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {labels[field]}
                </label>
                <input
                  inputMode="decimal"
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`}
                  placeholder="Optional"
                />
                {errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field]}</p> : null}
              </div>
            );
          }
          return (
            <div key={field}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{labels[field]}</label>
              <input
                value={form[field]}
                onChange={(e) => update(field, e.target.value)}
                className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`}
                placeholder={`Enter ${labels[field].toLowerCase()}`}
                inputMode={field === "phone" || field === "whatsapp" || field === "pincode" ? "tel" : "text"}
              />
              {errors[field] ? <p className="mt-1 text-xs font-bold text-red-600">{errors[field]}</p> : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <label className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100">
          <input
            type="checkbox"
            checked={Boolean(form.deliveryAvailable)}
            onChange={(e) => update("deliveryAvailable", e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Delivery available from this shop
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 transition disabled:bg-emerald-300"
      >
        {loading ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
};

export default ShopApplicationForm;
