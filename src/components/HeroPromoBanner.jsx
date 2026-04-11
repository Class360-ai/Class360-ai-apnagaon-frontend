import React from "react";
import { ArrowRight } from "lucide-react";
import useTranslation from "../utils/useTranslation";

const HeroPromoBanner = ({ promo, onClick }) => {
  const { tx } = useTranslation();

  return (
    <button type="button" className="ag-hero-banner" onClick={onClick} aria-label={tx(promo?.headline) || "Promo"}>
      <div className="ag-hero-copy">
        <p className="ag-hero-kicker">{tx("APNAGAON SUPER DEAL")}</p>
        <h2>{tx(promo?.headline) || tx("Daily Essentials at Best Price")}</h2>
        <p>{tx(promo?.subline) || tx("Fast delivery in your village")}</p>
        <p className="ag-hero-meta">{tx(promo?.meta) || tx("Fresh Produce • Water • Grocery")}</p>
        <span className="ag-hero-cta">
          {tx(promo?.cta) || tx("Explore ApnaGaon")}
          <ArrowRight size={14} />
        </span>
      </div>

      <div className="ag-hero-highlights">
        {(promo?.highlights || []).map((item) => (
          <span key={item.id || item.label} className="ag-hero-bubble">
            <em>{item.icon || "✨"}</em>
            <small>{tx(item.label) || tx("ApnaGaon")}</small>
          </span>
        ))}
      </div>
    </button>
  );
};

export default HeroPromoBanner;
