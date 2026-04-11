import React from "react";
import { Smartphone } from "lucide-react";
import { UPI_METHODS } from "../../utils/upiPayments";

const UPIOptionsList = ({ provider, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {UPI_METHODS.map((method) => {
        const selected = provider === method;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onSelect(method)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-xs font-black ring-1 transition ${
              selected ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-600 ring-slate-200"
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${selected ? "bg-white/15" : "bg-emerald-50 text-emerald-700"}`}>
              <Smartphone className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate">{method}</span>
          </button>
        );
      })}
    </div>
  );
};

export default UPIOptionsList;
