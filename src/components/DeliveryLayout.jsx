import React from "react";
import RoleBasedNav from "./RoleBasedNav";
import { getRoleLabel } from "../utils/roleUtils";
import { useAuth } from "../context/useAuth";
import NotificationBell from "./NotificationBell";

const DeliveryLayout = ({ children }) => {
  const auth = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="mb-4 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{getRoleLabel(auth.user?.role)}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">Delivery Panel</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Track assigned deliveries and update the rider flow.</p>
            </div>
            <NotificationBell />
          </div>
        </div>
        {children}
      </div>
      <RoleBasedNav role="delivery" />
    </div>
  );
};

export default DeliveryLayout;
