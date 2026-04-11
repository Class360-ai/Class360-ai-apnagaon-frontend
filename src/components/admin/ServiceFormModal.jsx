import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const INITIAL_FORM = {
  serviceType: "",
  providerName: "",
  phone: "",
  area: "",
  city: "",
  price: "",
  available: true,
};

const ServiceFormModal = ({ open, initialData, onClose, onSave }) => {
  const base = useMemo(() => ({ ...INITIAL_FORM, ...(initialData || {}) }), [initialData]);
  const [form, setForm] = useState(base);

  useEffect(() => {
    if (open) setForm(base);
  }, [base, open]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      price: Number(form.price) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Service</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{initialData ? "Edit Service" : "Add Service"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["serviceType", "Service type"],
              ["providerName", "Provider name"],
              ["phone", "Phone"],
              ["area", "Area / Village"],
              ["city", "City / District"],
              ["price", "Price", "number"],
            ].map(([field, label, type = "text"]) => (
              <label key={field} className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none"
                />
              </label>
            ))}
          </div>

          <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <span className="text-sm font-black text-slate-700">Available</span>
            <input type="checkbox" checked={form.available} onChange={(event) => setForm((current) => ({ ...current, available: event.target.checked }))} className="h-5 w-5 accent-emerald-600" />
          </label>
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <button type="submit" className="w-full rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100">
            Save Service
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceFormModal;
