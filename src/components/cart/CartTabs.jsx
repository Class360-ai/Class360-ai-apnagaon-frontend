import React from "react";
import { ShoppingBag, Wrench } from "lucide-react";

const tabs = [
  { id: "grocery", label: "Grocery", Icon: ShoppingBag },
  { id: "services", label: "Services", Icon: Wrench },
];

const CartTabs = ({ activeTab, onChange, groceryCount = 0, serviceCount = 0 }) => {
  const counts = {
    grocery: groceryCount,
    services: serviceCount,
  };

  return (
    <div className="grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-sm ring-1 ring-emerald-100">
      {tabs.map((tab) => {
        const { id, label } = tab;
        const IconComponent = tab.Icon;
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-bold transition ${
              active
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "text-slate-600 hover:bg-emerald-50"
            }`}
            aria-pressed={active}
          >
            <IconComponent className="h-4 w-4" strokeWidth={2} />
            <span>{label}</span>
            {counts[id] > 0 ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? "bg-white/20" : "bg-orange-100 text-orange-700"}`}>
                {counts[id]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

export default CartTabs;
