import React from "react";
import { Plus } from "lucide-react";

const ProductForm = ({ value, onChange, onSave }) => {
  const update = (key, nextValue) => onChange((current) => ({ ...current, [key]: nextValue }));
  return (
    <div className="grid gap-2 md:grid-cols-7">
      {["name", "category", "price", "stock", "minStockAlert", "unit"].map((key) => (
        <input key={key} value={value[key] ?? ""} onChange={(event) => update(key, event.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none" placeholder={key} />
      ))}
      <input value={value.description || ""} onChange={(event) => update("description", event.target.value)} className="rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none" placeholder="description" />
      <button type="button" onClick={onSave} className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white">
        <Plus className="mr-1 inline h-4 w-4" /> Add
      </button>
    </div>
  );
};

export default ProductForm;
