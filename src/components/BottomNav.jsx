import React from "react";
import { Grid3X3, Home, MapPin, ShoppingCart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import useTranslation from "../utils/useTranslation";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const { t } = useTranslation();
  const isRoleRoute = ["/admin", "/shop", "/delivery", "/partner", "/partners", "/settings", "/help", "/contact", "/faq", "/privacy-policy", "/terms", "/refund-policy", "/delivery-policy"].some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  if (isRoleRoute) return null;

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    if (path === "/cart") {
      return location.pathname === "/cart" || location.pathname === "/checkout";
    }
    if (path === "/profile") {
      return location.pathname === "/profile" || location.pathname === "/orders";
    }
    return location.pathname === path;
  };

  const navItems = [
    {
      id: "home",
      label: t("home"),
      icon: Home,
      path: "/",
    },
    {
      id: "village",
      label: t("village"),
      icon: MapPin,
      path: "/village",
    },
    {
      id: "categories",
      label: t("categories"),
      icon: Grid3X3,
      path: "/categories",
    },
    {
      id: "cart",
      label: t("cart"),
      icon: ShoppingCart,
      path: "/cart",
      badge: getCartItemCount(),
    },
    {
      id: "profile",
      label: t("profile"),
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-2 py-1 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1 transition-all duration-200 ${
                active ? "text-emerald-600" : "text-gray-500 hover:text-gray-700"
              }`}
              aria-label={item.label}
            >
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-emerald-600 rounded-full"></div>
              )}
              <div className="relative mb-1">
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${active ? "scale-110" : ""}`}
                  strokeWidth={active ? 2 : 1.5}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${active ? "text-emerald-600" : "text-gray-500"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
