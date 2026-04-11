import React from "react";
import { ChevronRight, Home } from "lucide-react";
import useTranslation from "../utils/useTranslation";

const DeliveryAddressStrip = ({ address, timeText = "10 min", onAddressClick, onTimeClick }) => {
  const { t } = useTranslation();

  return (
    <div className="ag-home-address-row">
      <button type="button" className="ag-home-address-strip" onClick={onAddressClick} aria-label={t("address")}>
        <span className="ag-home-address-icon" aria-hidden="true">
          <Home size={13} />
        </span>
        <span className="ag-home-address-text">{address || t("homeAddressFallback")}</span>
        <ChevronRight size={14} className="ag-home-address-arrow" />
      </button>

      <button type="button" className="ag-home-address-time" onClick={onTimeClick} aria-label={t("deliveryInTenMin")}>
        {timeText || t("tenMin")}
      </button>
    </div>
  );
};

export default DeliveryAddressStrip;
