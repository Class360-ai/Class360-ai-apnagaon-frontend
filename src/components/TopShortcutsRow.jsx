import React from "react";
import { Clock3, Languages, Sparkles, Store } from "lucide-react";
import useTranslation from "../utils/useTranslation";

const TopShortcutsRow = ({ onApnaGaon, onFastDelivery, onSmartVillage, onLanguageSwitch }) => {
  const { t } = useTranslation();
  const items = [
    { id: "apnagaon", label: t("apnaGaon"), icon: Store, onClick: onApnaGaon },
    { id: "ten-minutes", label: t("tenMinutes"), icon: Clock3, onClick: onFastDelivery },
    { id: "smart-village", label: t("smartVillageLabel"), icon: Sparkles, onClick: onSmartVillage },
    { id: "language", label: t("language"), icon: Languages, onClick: onLanguageSwitch },
  ];

  return (
    <section className="ag-home-top-shortcuts" aria-label={t("quickChips")}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className="ag-home-top-shortcut-card"
            onClick={() => item.onClick?.()}
            aria-label={item.label}
          >
            <span className="ag-home-top-shortcut-icon" aria-hidden="true">
              <Icon size={17} />
            </span>
            <span className="ag-home-top-shortcut-label">{item.label}</span>
          </button>
        );
      })}
    </section>
  );
};

export default TopShortcutsRow;
