import React from "react";
import useTranslation from "../utils/useTranslation";

const SidebarMenu = ({ tabs = [], activeId, onSelect }) => {
  const { tx, t } = useTranslation();

  return (
    <aside className="ag-browser-sidebar" aria-label={t("categories")}>
      <div className="ag-browser-sidebar-scroll">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          const name = tx(tab.name) || t("category");
          return (
            <button
              key={tab.id}
              type="button"
              className={`ag-browser-sidebar-item ${isActive ? "is-active" : ""}`}
              onClick={() => onSelect(tab.id)}
              aria-pressed={isActive}
            >
              <span className="ag-browser-sidebar-icon" aria-hidden="true">
                {tab.icon || "AG"}
              </span>
              <span className="ag-browser-sidebar-label">{name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SidebarMenu;
