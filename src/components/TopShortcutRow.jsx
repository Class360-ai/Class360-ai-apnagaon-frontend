import React from "react";

const TopShortcutRow = ({ shortcuts = [], onShortcutClick }) => {
  if (!Array.isArray(shortcuts) || shortcuts.length === 0) {
    return null;
  }

  return (
    <section className="ag-top-shortcuts" aria-label="Quick shortcuts">
      <div className="ag-top-shortcuts-track">
        {shortcuts.map((shortcut, index) => (
          <button
            key={shortcut?.id || `${shortcut?.name || "shortcut"}-${index}`}
            type="button"
            className="ag-top-shortcut-card"
            onClick={() => onShortcutClick?.(shortcut)}
            aria-label={shortcut?.name || "Shortcut"}
          >
            <span className="ag-top-shortcut-icon" aria-hidden="true">
              {shortcut?.icon || "✨"}
            </span>
            <span className="ag-top-shortcut-label">{shortcut?.name || "Explore"}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TopShortcutRow;
