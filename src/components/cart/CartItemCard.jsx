import React from "react";
import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../../utils/helpers";

const CartItemCard = ({ item, title, subtitle, onDecrease, onIncrease, onRemove }) => {
  const quantity = Number(item?.quantity) || 1;
  const price = Number(item?.price) || 0;

  return (
    <article className="rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="flex gap-3">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[20px] bg-emerald-50">
          {item?.image ? (
            <img
              src={item.image}
              alt={title || "Cart item"}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-emerald-700">
              <Package className="h-8 w-8" strokeWidth={1.7} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-950">{title}</h3>
              {subtitle ? <p className="mt-1 truncate text-xs font-medium text-slate-500">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full bg-slate-50 p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove ${title || "item"}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-base font-black text-slate-950">{formatPrice(price * quantity)}</p>
              {quantity > 1 ? <p className="text-[11px] font-semibold text-slate-400">{formatPrice(price)} each</p> : null}
            </div>

            <div className="flex items-center gap-2 rounded-full bg-emerald-50 p-1 ring-1 ring-emerald-100">
              <button
                type="button"
                onClick={onDecrease}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm"
                aria-label={`Decrease ${title || "item"} quantity`}
              >
                {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <span className="min-w-6 text-center text-sm font-black text-emerald-800">{quantity}</span>
              <button
                type="button"
                onClick={onIncrease}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
                aria-label={`Increase ${title || "item"} quantity`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItemCard;
