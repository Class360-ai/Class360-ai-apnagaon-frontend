import React from "react";
import useTranslation from "../utils/useTranslation";

const safeText = (value, fallback = "") => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  return fallback;
};

const OffersRowSection = ({ title = "Today's Offers", offers = [], onOrderNow }) => {
  const { tx, t } = useTranslation();
  const safeOffers = Array.isArray(offers) ? offers.filter(Boolean) : [];

  if (safeOffers.length === 0) {
    return null;
  }

  return (
    <section className="ag-offers-row-section">
      <header className="ag-offers-row-head">
        <h3>{tx(title) || "Today's Offers"}</h3>
      </header>

      <div className="ag-offers-row-track">
        {safeOffers.map((offer, index) => {
          const key = safeText(offer?.id, `offer-${index}`);
          const titleText = tx(offer?.title) || t("item");
          const discountText = tx(offer?.discount) || "OFF";
          const tagText = tx(offer?.tag) || t("popular");
          const items = Array.isArray(offer?.items) ? offer.items.filter(Boolean) : [];
          const firstItem = tx(items[0]) || tx(offer?.type) || t("item");
          const validTill = tx(offer?.validTill) || tx("Today") || "Today";
          const icon = safeText(offer?.icon, "🎁");

          return (
            <article key={key} className="ag-offer-card">
              <div className="ag-offer-top-row">
                <span className="ag-offer-discount">{discountText}</span>
                <span className="ag-offer-tag">{tagText}</span>
              </div>

              <div className="ag-offer-icon" aria-hidden="true">
                {icon}
              </div>

              <h4>{titleText}</h4>
              <p>{firstItem}</p>
              <small>{validTill}</small>

              <button type="button" onClick={() => onOrderNow?.(offer)}>
                {t("order") || "Order Now"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default OffersRowSection;
