import React from "react";
import { Package, Plus } from "lucide-react";
import { formatPrice } from "../../utils/helpers";

const RecommendationRow = ({ title, subtitle, items = [], onAddToCart }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <article key={item.id} className="w-36 flex-shrink-0 rounded-[22px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 h-24 overflow-hidden rounded-[18px] bg-emerald-50">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name || "Recommendation"}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-emerald-700">
                  <Package className="h-7 w-7" strokeWidth={1.7} />
                </div>
              )}
            </div>
            <h3 className="truncate text-sm font-black text-slate-950">{item.name}</h3>
            <p className="mt-1 truncate text-xs font-semibold text-slate-400">{item.unit || item.subtitle || "Quick add"}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-black text-slate-950">{formatPrice(Number(item.price) || 0)}</span>
              <button
                type="button"
                onClick={() => onAddToCart(item)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm"
                aria-label={`Add ${item.name || "item"} to cart`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecommendationRow;
