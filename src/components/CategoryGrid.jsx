import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { getOffersByCategory } from "../data/seed-data";

const CategoryGrid = ({ categories, columns = 4 }) => {
  const navigate = useNavigate();
  const { lang } = useTranslation();

  const gridColumns =
    columns === 2
      ? "grid-cols-2 sm:grid-cols-2"
      : columns === 3
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={`grid gap-3 ${gridColumns}`}>
      {categories?.map((category, index) => {
        const categoryOffers = getOffersByCategory(category.slug);
        const hasOffers = categoryOffers.length > 0;
        
        return (
        <button
          key={category.id}
          onClick={() => navigate(`/${category.slug}`)}
          className="group relative flex flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-br from-white to-slate-50 p-4 text-center shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-50 to-yellow-100 text-3xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-sm">
            {category.emoji}
          </div>
          <span className="relative z-10 text-xs font-semibold text-gray-800 leading-tight transition-colors duration-300 group-hover:text-gray-900">
            {lang === "hi" ? category.nameHi : category.name}
          </span>
          {hasOffers && (
            <div className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2 py-1 shadow-md">
              <span className="flex items-center gap-1 text-[10px] font-bold text-white">
                <Zap className="w-3 h-3" />
                {lang === "hi" ? "डील" : "Deal"}
              </span>
            </div>
          )}
          {!hasOffers && index % 3 === 0 && (
            <span className="absolute top-2 right-2 text-xs font-bold text-red-500">
              🔥
            </span>
          )}
          {!hasOffers && index % 3 === 1 && (
            <span className="absolute top-2 right-2 text-xs font-bold text-blue-500">
              ⚡
            </span>
          )}
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-3xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150"></div>
        </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
