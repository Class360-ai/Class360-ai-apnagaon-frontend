import React from "react";
import AppCard from "./AppCard";
import useTranslation from "../utils/useTranslation";

const SectionBlock = ({ section = {}, categoryName = "", onItemAction }) => {
  const { tx, t } = useTranslation();
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) {
    return null;
  }

  const layout = section.layout || "grid";
  const sectionTitle = tx(section.title) || t("section");

  return (
    <section className="ag-browser-section" aria-label={sectionTitle}>
      <div className="ag-browser-section-head">
        <h2>{sectionTitle}</h2>
      </div>
      <div className={`ag-browser-section-content ag-browser-${layout}`}>
        {items.map((entry) => (
          <AppCard
            key={entry.id || `${section.id}-${entry.name}`}
            entry={entry}
            layout={layout}
            onAction={(clickedEntry) =>
              onItemAction?.({
                entry: clickedEntry,
                categoryName,
                sectionTitle,
              })
            }
          />
        ))}
      </div>
    </section>
  );
};

export default SectionBlock;
