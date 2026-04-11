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

  const placeholderImage = "https://via.placeholder.com/220x220?text=Food+Item&bg=FFF8F2&fg=FF7A18";

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
      style={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden h-48 bg-[#FFF8F2]">
        <img
          src={
            !imageError
              ? food.image || placeholderImage
              : placeholderImage
          }
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          alt={food.name || "Food item"}
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Top-left Discount Badge */}
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

        {/* Top-right Badge (Popular/Best Seller) */}
        {food.badge ? (
          <div className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#FF7A18] shadow-md">
            {lang === "hi"
              ? food.badgeHi || food.badge
              : food.badge}
          </div>
        ) : null}

        {/* Rating Badge (if available) */}
        {food.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-[#1A1A1A] shadow-md">
            <Star className="w-3 h-3 fill-[#FF7A18] text-[#FF7A18]" />
            {food.rating}
          </div>
        )}
        {outOfStock ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
            Out of Stock
          </div>
        ) : null}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Restaurant/Shop Name (if available) */}
        {food.shopName && (
          <p className="text-xs font-medium text-[#777]">
            {lang === "hi" ? food.shopNameHi || food.shopName : food.shopName}
          </p>
        )}

        {/* Item Name */}
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-2">
            {lang === "hi" ? food.nameHi || food.name : food.name}
          </h3>
        </div>

        {/* Description */}
        {food.description && (
          <p className="text-xs text-[#777] line-clamp-2">
            {lang === "hi"
              ? food.descriptionHi || food.description
              : food.description}
          </p>
        )}

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          {food.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#FF7A18] text-[#FF7A18]" />
              <span className="text-xs font-semibold text-[#1A1A1A]">
                {food.rating}
              </span>
              {food.reviews && (
                <span className="text-xs text-[#777]">
                  ({food.reviews})
                </span>
              )}
            </div>
          )}
          {food.deliveryTime && (
            <span className="text-xs text-[#777]">
              {food.deliveryTime}
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#1A1A1A]">
            {food.price ? formatPrice(food.price) : "Price on request"}
          </span>
          {food.originalPrice && food.originalPrice > food.price ? (
            <span className="text-xs text-[#777] line-through">
              {formatPrice(food.originalPrice)}
            </span>
          ) : null}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {!isInCart ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (outOfStock) return;
              onAddToCart?.(food);
            }}
            disabled={outOfStock}
            className="w-full mt-3 rounded-xl font-bold py-2.5 text-sm text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
            style={{
              background: outOfStock ? "#cbd5e1" : "linear-gradient(135deg, #FF3B30, #FF7A18)",
            }}
          >
            <Plus className="w-4 h-4" />
            {outOfStock ? "Out of Stock" : t("add") || "Add"}
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl p-2 mt-3" style={{ backgroundColor: "#FFF8F2" }}>
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
            <span className="text-sm font-bold text-[#1A1A1A]">
              {cartQuantity}
            </span>
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
        )}
      </div>
    </div>
  );
};

export default FoodCard;
