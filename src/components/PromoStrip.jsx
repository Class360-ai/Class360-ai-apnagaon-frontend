import React from "react";
import { ChevronRight } from "lucide-react";
import useTranslation from "../utils/useTranslation";

const PromoStrip = ({ promo, onClick }) => {
  const { tx } = useTranslation();

  return (
    <button type="button" className="ag-mini-promo" onClick={onClick} aria-label={tx(promo?.title) || "Promo"}>
      <span className="ag-mini-promo-badge">{tx(promo?.badge) || tx("Top Village Deals")}</span>
      <strong>{tx(promo?.title) || tx("Local Shops • Best Offers")}</strong>
      <span className="ag-mini-promo-tag">
        {tx(promo?.tag) || tx("Up to 40% Off")}
        <ChevronRight size={13} />
      </span>
    </button>
  );
};

export default PromoStrip;
