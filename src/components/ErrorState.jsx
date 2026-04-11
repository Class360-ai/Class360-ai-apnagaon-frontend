import React from "react";
import { AlertTriangle } from "lucide-react";

const ErrorState = ({
  icon: Icon = AlertTriangle,
  title = "Something needs attention",
  description = "We couldn’t complete that action right now.",
  primaryAction,
  primaryActionText = "Try again",
  secondaryAction,
  secondaryActionText = "Go back",
  helperText,
  className = "",
}) => {
  return (
    <div className={`rounded-[28px] bg-white px-4 py-8 shadow-sm ring-1 ring-rose-100 ${className}`}>
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-rose-50 text-rose-600 ring-1 ring-rose-100">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
        {helperText ? <p className="mt-3 text-xs font-semibold text-rose-600">{helperText}</p> : null}
        {(primaryAction || secondaryAction) && (
          <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row">
            {secondaryAction ? (
              <button
                type="button"
                onClick={secondaryAction}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
              >
                {secondaryActionText}
              </button>
            ) : null}
            {primaryAction ? (
              <button
                type="button"
                onClick={primaryAction}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:opacity-95"
              >
                {primaryActionText}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
