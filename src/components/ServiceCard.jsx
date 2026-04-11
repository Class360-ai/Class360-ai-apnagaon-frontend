import React from "react";
import { Phone, MapPin, Star, MessageCircle } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { formatPrice } from "../utils/helpers";

const ServiceCard = ({
  service,
  onCallClick,
  onWhatsAppClick,
  onDetailsClick,
}) => {
  const { t, lang } = useTranslation();

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    onDetailsClick?.(service);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300">
        <img
          src={service.image || "https://via.placeholder.com/200x200?text=Service"}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200x200?text=Service";
          }}
          className="w-full h-full object-cover"
          alt={service.name}
        />
        {service.badge && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            {lang === "hi" ? service.badgeHi : service.badge}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <div className="flex justify-between items-start gap-2 mb-1">
          <div>
            <h4 className="font-semibold text-sm line-clamp-2">
              {lang === "hi" ? service.nameHi || service.name : service.name}
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              {lang === "hi"
                ? service.providerHi || service.provider
                : service.provider}
            </p>
          </div>
          {service.rating && (
            <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold text-yellow-800">
              <Star className="w-3 h-3" strokeWidth={1.5} />
              <span>{service.rating}</span>
            </div>
          )}
        </div>

        {/* Area */}
        {service.area && (
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <MapPin className="w-3 h-3" strokeWidth={1.5} />
            </span>
            <span>{lang === "hi" ? service.areaHi : service.area}</span>
          </div>
        )}

        {/* Fee */}
        {service.fee && (
          <p className="text-sm font-semibold text-green-600 mb-2">
            {formatPrice(service.fee)} {service.feeType}
          </p>
        )}

        {/* Availability */}
        {service.availability && (
          <p className="text-xs text-gray-600 mb-2">
            {lang === "hi"
              ? service.availabilityHi
              : service.availability}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhatsAppClick?.(service);
            }}
            className="flex-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold py-2 transition hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <span>{t("inquireNow")}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCallClick?.(service);
            }}
            className="flex-1 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold py-2 transition hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <Phone className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <span>{t("callNow")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
