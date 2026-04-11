import React from "react";

const ACTIONS = [
  { status: "picked_up", label: "Picked Up", tone: "orange" },
  { status: "on_the_way", label: "On the Way", tone: "blue" },
  { status: "delivered", label: "Delivered", tone: "emerald" },
  { status: "failed_delivery", label: "Failed", tone: "red" },
];

const toneClass = {
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  emerald: "bg-emerald-600 text-white ring-emerald-600",
  red: "bg-red-50 text-red-700 ring-red-100",
};

const DeliveryStatusActions = ({ onChange, disabled = false }) => (
  <div className="grid grid-cols-2 gap-2">
    {ACTIONS.map((action) => (
      <button
        key={action.status}
        type="button"
        disabled={disabled}
        onClick={() => onChange?.(action.status)}
        className={`rounded-full px-4 py-3 text-xs font-black uppercase tracking-wide ring-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass[action.tone]}`}
      >
        {action.label}
      </button>
    ))}
  </div>
);

export default DeliveryStatusActions;
