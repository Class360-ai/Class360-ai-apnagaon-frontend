import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

const INITIAL_FORM = {
  name: "",
  category: "",
  price: "",
  unit: "1 unit",
  image: "",
  description: "",
  available: true,
  stock: 0,
  minStockAlert: 5,
  tags: "",
};

const ProductFormModal = ({ open, initialData, onClose, onSave }) => {
  const base = useMemo(
    () => ({
      ...INITIAL_FORM,
      ...(initialData || {}),
      tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
    }),
    [initialData]
  );
  const [form, setForm] = useState(base);

  useEffect(() => {
    if (open) setForm(base);
  }, [base, open]);

  if (!open) return null;

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      minStockAlert: Number(form.minStockAlert) || 5,
      tags: String(form.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Product</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{initialData ? "Edit Product" : "Add Product"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["name", "Product name"],
              ["category", "Category"],
              ["price", "Price", "number"],
              ["unit", "Unit"],
              ["stock", "Stock", "number"],
              ["minStockAlert", "Min stock alert", "number"],
              ["image", "Image URL"],
            ].map(([field, label, type = "text"]) => (
              <label key={field} className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none"
                />
              </label>
            ))}
          </div>

          <label className="mt-3 grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Description</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none"
            />
          </label>

          <label className="mt-3 grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Tags</span>
            <input
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              placeholder="milk, daily, fresh"
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none"
            />
          </label>

          <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
            <span className="text-sm font-black text-slate-700">Available</span>
            <input type="checkbox" checked={form.available} onChange={(event) => updateField("available", event.target.checked)} className="h-5 w-5 accent-emerald-600" />
          </label>
        </div>
        <div className="border-t border-slate-100 px-4 py-4">
          <button type="submit" className="w-full rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormModal;
