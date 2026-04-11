import React from "react";
import { useNavigate } from "react-router-dom";
import "./topShortcutStrip.css";

const DEFAULT_SHORTCUTS = [
  { id: "grocery", name: "Grocery", icon: "🛒", route: "/grocery" },
  { id: "fresh", name: "Fresh", icon: "🥦", route: "/fresh-produce" },
  { id: "food", name: "Food", icon: "🍔", route: "/food" },
  { id: "services", name: "Services", icon: "🧰", route: "/services" },
  { id: "water", name: "Water", icon: "🚰", route: "/water-gas" },
  { id: "gas", name: "Gas", icon: "🔥", route: "/water-gas" },
  { id: "coaching", name: "Coaching", icon: "📘", route: "/coaching" },
  { id: "jobs", name: "Jobs", icon: "💼", route: "/jobs" },
];

const TopShortcutStrip = ({ shortcuts = DEFAULT_SHORTCUTS, className = "" }) => {
  const navigate = useNavigate();

  const onShortcutClick = (shortcut) => {
    const route = shortcut?.route;
    if (!route || typeof route !== "string") {
      navigate("/");
      return;
    }
    navigate(route);
  };

  if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
    return null;
  }

  return (
    <section className={`ag-shortcut-strip ${className}`.trim()} aria-label="Quick shortcuts">
      <div className="ag-shortcut-strip-track">
        {shortcuts.map((shortcut, index) => (
          <button
            key={shortcut?.id || `${shortcut?.name || "shortcut"}-${index}`}
            type="button"
            className="ag-shortcut-card"
            onClick={() => onShortcutClick(shortcut)}
            aria-label={shortcut?.name || "Shortcut"}
          >
            <span className="ag-shortcut-icon" aria-hidden="true">
              {shortcut?.icon || "✨"}
            </span>
            <span className="ag-shortcut-label">{shortcut?.name || "Explore"}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TopShortcutStrip;
