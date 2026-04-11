import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoleRoutes, normalizeRole } from "../utils/roleUtils";

const RoleBasedNav = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = getRoleRoutes(normalizeRole(role));

  if (!routes.length) return null;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur safe-area-inset-bottom">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
        {routes.map((route) => {
          const active = isActive(route.path);
          return (
            <button
              key={route.path}
              type="button"
              onClick={() => navigate(route.path)}
              className={`shrink-0 rounded-full px-4 py-3 text-xs font-black uppercase tracking-wide ring-1 transition ${
                active ? "bg-emerald-600 text-white ring-emerald-600 shadow-sm shadow-emerald-100" : "bg-white text-slate-600 ring-slate-100"
              }`}
            >
              {route.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleBasedNav;
