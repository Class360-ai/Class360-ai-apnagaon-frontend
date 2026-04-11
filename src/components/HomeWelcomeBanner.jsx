import React from "react";

const HomeWelcomeBanner = ({ visible, fading }) => {
  if (!visible) {
    return null;
  }

  return (
    <div
      className={[
        "pointer-events-none mb-2 rounded-2xl border border-emerald-200 bg-white px-3 py-2 shadow-sm transition-all duration-500",
        fading ? "translate-y-[-4px] opacity-0" : "translate-y-0 opacity-100",
      ].join(" ")}
      aria-live="polite"
    >
      <p className="text-sm font-bold text-emerald-700">Welcome to ApnaGaon 👋</p>
      <p className="text-xs font-medium text-slate-600">Your village, now online</p>
    </div>
  );
};

export default HomeWelcomeBanner;
