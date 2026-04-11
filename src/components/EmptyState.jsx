import React from "react";
import useTranslation from "../utils/useTranslation";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionText,
  secondaryAction,
  secondaryActionText,
  helperText,
  className = "",
}) => {
  const { t } = useTranslation();

  return (
    <div className={`rounded-[28px] border border-dashed border-emerald-100 bg-white px-4 py-8 shadow-sm ring-1 ring-emerald-50 ${className}`}>
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-50 to-orange-50 text-emerald-700 ring-1 ring-emerald-100">
          {Icon ? <Icon className="h-8 w-8" /> : <span className="text-2xl">•</span>}
        </div>
        <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p>
        {helperText ? <p className="mt-3 text-xs font-semibold text-emerald-700">{helperText}</p> : null}
        {(action || secondaryAction) && (
          <div className="mt-5 flex w-full flex-col gap-2 sm:flex-row">
            {secondaryAction ? (
              <button
                type="button"
                onClick={secondaryAction}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
              >
                {secondaryActionText || t("back")}
              </button>
            ) : null}
            {action ? (
              <button
                type="button"
                onClick={action}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:opacity-95"
              >
                {actionText || t("back")}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
