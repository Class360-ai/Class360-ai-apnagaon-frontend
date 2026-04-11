import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const PaymentFailureCard = ({ title = "Payment failed", description = "We could not complete the payment right now.", onRetry, onSwitchToCod }) => {
  return (
    <section className="rounded-[26px] bg-red-50 p-4 ring-1 ring-red-100">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 ring-1 ring-red-100">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-red-900">{title}</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-red-700">{description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-100"
        >
          <RefreshCw className="h-4 w-4" />
          Retry payment
        </button>
        {typeof onSwitchToCod === "function" ? (
          <button
            type="button"
            onClick={onSwitchToCod}
            className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-red-100"
          >
            Switch to COD
          </button>
        ) : null}
      </div>
    </section>
  );
};

export default PaymentFailureCard;
