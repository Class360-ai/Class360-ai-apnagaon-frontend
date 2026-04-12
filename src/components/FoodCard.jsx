import React, { useState } from "react";
import { Plus, Minus, Trash2, Star } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { formatPrice } from "../utils/helpers";

const FoodCard = ({
  food,
  isInCart,
  cartQuantity = 0,
  onAddToCart,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveFromCart,
  onCardClick,
}) => {
  const { t, lang } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const outOfStock = food.available === false || Number(food.stock) === 0;

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    onCardClick?.(food);
  };

  const placeholderImage = "https://via.placeholder.com/400x400?text=Food+Item&bg=FFF8F2&fg=FF7A18";
  const imageSrc = !imageError ? food.image || placeholderImage : placeholderImage;
  const name = lang === "hi" ? food.nameHi || food.name : food.name;
  const badgeText = lang === "hi" ? food.badgeHi || food.badge : food.badge;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="relative aspect-[1/1] overflow-hidden bg-[#FFF8F2]">
        <img
          src={imageSrc}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          alt={food.name || "Food item"}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

        {food.discount ? (
          <div
            className="absolute top-3 left-3 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FF3B30, #FF7A18)",
            }}
          >
            {food.discount}% OFF
          </div>
        ) : null}

        {badgeText ? (
          <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#FF7A18] shadow-md">
            {badgeText}
          </div>
        ) : null}

        {outOfStock ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
            Out of Stock
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 space-y-3">
        {food.shopName ? (
          <p className="text-xs font-medium text-[#777]">
            {lang === "hi" ? food.shopNameHi || food.shopName : food.shopName}
          </p>
        ) : null}

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-2">
            {name}
          </h3>
          {food.description ? (
            <p className="mt-1 text-xs text-[#777] line-clamp-2">
              {lang === "hi" ? food.descriptionHi || food.description : food.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {food.rating ? (
              <>
                <Star className="w-3.5 h-3.5 fill-[#FF7A18] text-[#FF7A18]" />
                <span className="text-xs font-semibold text-[#1A1A1A]">{food.rating}</span>
                {food.reviews ? <span className="text-xs text-[#777]">({food.reviews})</span> : null}
              </>
            ) : (
              <span className="text-xs text-[#777]">Fresh pick</span>
            )}
          </div>
          {food.deliveryTime ? <span className="text-xs text-[#777]">{food.deliveryTime}</span> : null}
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-[#1A1A1A]">
            {food.price ? formatPrice(food.price) : "Price on request"}
          </span>
          {food.originalPrice && food.originalPrice > food.price ? (
            <span className="text-xs text-[#777] line-through">
              {formatPrice(food.originalPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-auto">
          {!isInCart ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (outOfStock) return;
                onAddToCart?.(food);
              }}
              disabled={outOfStock}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
              style={{
                background: outOfStock ? "#cbd5e1" : "linear-gradient(135deg, #FF3B30, #FF7A18)",
              }}
            >
              <Plus className="w-4 h-4" />
              {outOfStock ? "Out of Stock" : t("add") || "Add"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl p-2" style={{ backgroundColor: "#FFF8F2" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cartQuantity === 1) {
                      onRemoveFromCart?.(food.id);
                    } else {
                      onDecreaseQty?.(food.id);
                    }
                  }}
                  className="rounded-lg p-1.5 transition hover:bg-white"
                  style={{ color: "#FF7A18" }}
                  aria-label="Decrease quantity"
                >
                  {cartQuantity === 1 ? (
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Minus className="w-4 h-4" strokeWidth={2} />
                  )}
                </button>
                <span className="text-sm font-bold text-[#1A1A1A]">{cartQuantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncreaseQty?.(food.id);
                  }}
                  className="rounded-lg p-1.5 transition hover:bg-white"
                  style={{ color: "#FF7A18" }}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
