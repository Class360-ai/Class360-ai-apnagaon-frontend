import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { formatPrice } from "../utils/helpers";

const ProductCard = ({
  product,
  isInCart,
  cartQuantity,
  onAddToCart,
  onBuyNow,
  onWhatsApp,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveFromCart,
  onCardClick,
}) => {
  const { t, lang } = useTranslation();
  const outOfStock = product.available === false || Number(product.stock) === 0;

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    onCardClick?.(product);
  };

  const imageSrc = product.image || "https://via.placeholder.com/400x400?text=Product";
  const name = lang === "hi" ? product.nameHi || product.name : product.name;
  const badgeText = lang === "hi" ? product.badgeHi || product.badge : product.badge;

  return (
    <div
      onClick={handleCardClick}
      className="flex h-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_18px_50px_-35px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20 cursor-pointer"
    >
      <div className="relative aspect-[1/1] overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/400x400?text=No+Image";
          }}
          className="h-full w-full object-cover"
          alt={product.name || "Product"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent" />

        {product.discount ? (
          <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            {product.discount}% OFF
          </div>
        ) : null}

        {badgeText ? (
          <div className="absolute right-3 top-3 rounded-full bg-green-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
            {badgeText}
          </div>
        ) : null}

        {outOfStock ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
            Out of Stock
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col space-y-2 p-4">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {name}
          </h4>
          {product.unit ? (
            <p className="mt-1 text-[11px] text-gray-500">{product.unit}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
        </div>

        {product.rating ? (
          <div className="flex flex-wrap items-center gap-1 text-xs text-yellow-500">
            <span aria-hidden="true">★</span>
            <span>{product.rating}</span>
            {product.reviews ? <span className="text-gray-400">({product.reviews})</span> : null}
          </div>
        ) : null}

        <div className="mt-auto">
          {!isInCart ? (
            <div className="space-y-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (outOfStock) return;
                  onAddToCart?.(product);
                }}
                disabled={outOfStock}
                className="w-full rounded-3xl gradient-orange-bold px-3 py-2 text-sm font-semibold text-white shadow-premium transition-all duration-300 hover:scale-105 hover:shadow-premium-lg active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
              >
                {outOfStock ? "Out of Stock" : t("add")}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (outOfStock) return;
                    onBuyNow?.(product);
                  }}
                  disabled={outOfStock}
                  className="rounded-3xl border-2 border-[#0BA360] bg-white px-3 py-2 text-sm font-semibold text-[#0BA360] shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg active:scale-95 disabled:border-slate-200 disabled:text-slate-400"
                >
                  Buy Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWhatsApp?.(product);
                  }}
                  className="rounded-3xl bg-gradient-to-r from-[#0BA360] to-[#3CD3AD] px-3 py-2 text-sm font-semibold text-white shadow-premium transition-all duration-300 hover:shadow-premium-lg active:scale-95"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-3xl bg-[#FFF3E5] p-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cartQuantity === 1) {
                      onRemoveFromCart?.(product.id);
                    } else {
                      onDecreaseQty?.(product.id);
                    }
                  }}
                  className="rounded-2xl bg-white p-2 text-[#FF7A18] shadow-premium transition hover:bg-[#FFE5CC]"
                  aria-label="Decrease quantity"
                >
                  {cartQuantity === 1 ? <Trash2 className="w-4 h-4" strokeWidth={1.5} /> : <Minus className="w-4 h-4" strokeWidth={1.5} />}
                </button>
                <span className="text-sm font-semibold text-[#FF7A18]">{cartQuantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncreaseQty?.(product.id);
                  }}
                  className="rounded-2xl bg-white p-2 text-[#FF7A18] shadow-premium transition hover:bg-[#FFE5CC]"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (outOfStock) return;
                    onBuyNow?.(product);
                  }}
                  disabled={outOfStock}
                  className="rounded-3xl border-2 border-[#0BA360] bg-white px-3 py-2 text-sm font-semibold text-[#0BA360] shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg active:scale-95 disabled:border-slate-200 disabled:text-slate-400"
                >
                  Buy Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWhatsApp?.(product);
                  }}
                  className="rounded-3xl bg-gradient-to-r from-[#0BA360] to-[#3CD3AD] px-3 py-2 text-sm font-semibold text-white shadow-premium transition-all duration-300 hover:shadow-premium-lg active:scale-95"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
