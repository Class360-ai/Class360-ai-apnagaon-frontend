import React from "react";
import useTranslation from "../utils/useTranslation";

const actionLabelMap = {
  cart: "add",
  whatsapp: "order",
  inquiry: "inquiry",
  book: "book",
  call: "call",
  view: "view",
};

const AppCard = ({ entry = {}, layout = "grid", onAction }) => {
  const { t, tx } = useTranslation();
  const label = tx(entry.actionLabel) || t(actionLabelMap[entry.actionType] || "view");
  const name = tx(entry.name) || t("item");
  const subtitle = tx(entry.subtitle) || t("services");
  const badge = tx(entry.badge) || "ApnaGaon";

  return (
    <article className={`ag-browser-card ag-browser-card-${layout}`}>
      <div className="ag-browser-card-media" aria-hidden="true">
        <span>{entry.icon || "AG"}</span>
      </div>
      <div className="ag-browser-card-body">
        <h3 className="ag-browser-card-title">{name}</h3>
        <p className="ag-browser-card-subtitle">{subtitle}</p>
        <div className="ag-browser-card-meta">
          <span className={`ag-browser-badge ${entry.badge ? "" : "is-muted"}`}>
            {badge}
          </span>
          <button
            type="button"
            className="ag-browser-action-btn"
            onClick={() => onAction?.(entry)}
            aria-label={`${label} ${name}`}
          >
            {label}
          </button>
        </div>
      </div>
    </article>
  );
};

export default AppCard;
