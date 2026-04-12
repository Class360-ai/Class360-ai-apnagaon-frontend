import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";

const emptyForm = {
  name: "",
  phone: "",
  vehicle: "Bike",
  area: "",
  status: "available",
};

const DeliveryPartnerForm = ({ onCreate, onSeed }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!String(form.name || "").trim() || !String(form.phone || "").trim()) {
      setMessage("Name and phone are required.");
      return;
    }
    setSaving(true);
    try {
      await onCreate?.(form);
      setForm(emptyForm);
      setMessage("Delivery partner added.");
    } catch (error) {
      setMessage(error?.message || "Unable to add partner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery partners</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">Add rider</h3>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Plus className="h-5 w-5" />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Name</span>
          <input value={form.name} onChange={(event) => update("name", event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Ravi Kumar" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Phone</span>
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="9876543210" inputMode="tel" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Vehicle</span>
          <input value={form.vehicle} onChange={(event) => update("vehicle", event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Bike" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          <span className="text-xs font-black uppercase tracking-wide text-slate-400">Area</span>
          <input value={form.area} onChange={(event) => update("area", event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500" placeholder="Azamgarh" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        <span className="text-xs font-black uppercase tracking-wide text-slate-400">Status</span>
        <select value={form.status} onChange={(event) => update("status", event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500">
          <option value="available">Available</option>
          <option value="busy">Busy</option>
        </select>
      </label>

      {message ? <p className="rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-600">{message}</p> : null}

      <button type="submit" disabled={saving} className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300">
        {saving ? "Saving..." : "Add partner"}
      </button>

      <button
        type="button"
        onClick={async () => {
          setMessage("");
          setSaving(true);
          try {
            await onSeed?.();
            setMessage("Sample delivery partners added.");
          } catch (error) {
            setMessage(error?.message || "Unable to seed sample partners.");
          } finally {
            setSaving(false);
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-100"
      >
        <Sparkles className="h-4 w-4" />
        Seed sample riders
      </button>
    </form>
  );
};

export default DeliveryPartnerForm;
