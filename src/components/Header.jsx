import React from "react";
import { MapPin, Clock, Search, Languages } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import NotificationBell from "./NotificationBell";

const Header = ({ onSearchClick, onLocationClick }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 shadow-lg backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-3xl bg-white/90 p-3 shadow-sm">
              <Clock className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/90 font-semibold">
                {t("deliveryIn")}
              </p>
              <p className="text-sm font-semibold text-white">
                {user?.village || "AzamGaon"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLocationClick}
              className="flex items-center justify-center rounded-2xl bg-white/90 p-2 shadow-sm hover:bg-white transition"
              aria-label="Change location"
            >
              <MapPin className="w-5 h-5 text-emerald-700" />
            </button>
            <NotificationBell />
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center rounded-2xl bg-white/90 p-2 shadow-sm hover:bg-white transition-all duration-200 hover:scale-105"
              aria-label="Toggle language"
            >
              <Languages className="w-5 h-5 text-emerald-700" />
              <span className="ml-1 text-xs font-bold text-emerald-700 uppercase">
                {language === "hi" ? "EN" : "हि"}
              </span>
            </button>
          </div>
        </div>

        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 shadow-lg rounded-full px-4 py-3 hover:shadow-xl focus:shadow-xl focus:border-white/50 transition-all duration-300"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-emerald-700 shadow-sm transition-transform duration-300 hover:scale-110">
            <Search className="w-4 h-4" strokeWidth={1.5} />
          </span>
          <span className="text-sm text-white/90">
            {t("searchPlaceholder")}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
