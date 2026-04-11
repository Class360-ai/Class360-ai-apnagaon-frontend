import React from "react";
import { ChevronRight, Home, Timer } from "lucide-react";

const DeliveryLocationBar = ({ location, onLocationClick, onEtaClick }) => {
  return (
    <div className="ag-delivery-row">
      <button type="button" className="ag-location-strip" onClick={onLocationClick} aria-label="Change delivery location">
        <span className="ag-location-icon" aria-hidden="true">
          <Home size={14} />
        </span>
        <span className="ag-location-copy">
          <small>{location?.label || "HOME"}</small>
          <strong>{location?.address || "Azampur, Azamgarh"}</strong>
        </span>
        <ChevronRight size={15} className="ag-location-arrow" />
      </button>

      <button type="button" className="ag-delivery-pill" onClick={onEtaClick} aria-label="Delivery timing">
        <Timer size={13} />
        <span>{location?.etaText || "Fast delivery"}</span>
      </button>
    </div>
  );
};

export default DeliveryLocationBar;
