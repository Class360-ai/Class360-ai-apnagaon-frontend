import React, { useState } from "react";
import { MessageCircle, Phone, Wrench } from "lucide-react";

const variantClassMap = {
  primary: "bg-green-500 text-white hover:bg-green-600",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
  ghost: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  dark: "bg-slate-900 text-white hover:bg-slate-800",
};

const getIconNode = (icon) => {
  if (React.isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === "string" && icon.trim()) {
    return <span className="text-lg leading-none">{icon}</span>;
  }
  return <Wrench className="h-5 w-5 text-slate-600" />;
};

const QuickCard = ({
  title,
  subtitle,
  icon,
  image,
  badge,
  actions,
  className = "",
  iconWrapClassName = "",
  imageAlt,
  animateIndex = 0,
}) => {
  const safeTitle = typeof title === "string" && title.trim() ? title.trim() : "Item";
  const safeSubtitle = typeof subtitle === "string" ? subtitle.trim() : "";
  const safeBadge = typeof badge === "string" && badge.trim() ? badge.trim() : "";
  const safeActions = Array.isArray(actions) ? actions.filter((a) => a && typeof a.onClick === "function") : [];
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = typeof image === "string" && image.trim() && !imageFailed;

  return (
    <article
      className={`ag-quick-card rounded-[20px] bg-white p-3.5 shadow-[0_10px_24px_rgba(2,6,23,0.06)] ring-1 ring-slate-100 transition-all duration-300 ease-out active:scale-[0.985] ${className}`.trim()}
      style={{ animationDelay: `${Math.max(0, animateIndex) * 55}ms` }}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 shadow-inner ${iconWrapClassName}`.trim()}>
          {hasImage ? (
            <img
              src={image}
              alt={imageAlt || safeTitle}
              className="h-11 w-11 rounded-2xl object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : null}
          {!hasImage ? getIconNode(icon) : null}
        </div>
        {safeBadge ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            {safeBadge}
          </span>
        ) : null}
      </div>

      <h3 className="text-sm font-bold text-slate-900">{safeTitle}</h3>
      {safeSubtitle ? <p className="mt-1.5 text-xs font-medium text-slate-500">{safeSubtitle}</p> : null}

      {safeActions.length > 0 ? (
        <div className={`mt-3.5 grid gap-2 ${safeActions.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {safeActions.map((action, index) => {
            const variantClass = variantClassMap[action.variant] || variantClassMap.ghost;
            const ActionIcon = action.icon === "call" ? Phone : action.icon === "whatsapp" ? MessageCircle : null;
            return (
              <button
                key={`${safeTitle}-${action.label || "action"}-${index}`}
                type="button"
                onClick={action.onClick}
                className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${variantClass}`}
                aria-label={action.ariaLabel || action.label || "Action"}
              >
                <span className="inline-flex items-center justify-center gap-1">
                  {ActionIcon ? <ActionIcon className="h-3.5 w-3.5" /> : null}
                  {action.label || "Action"}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </article>
  );
};

export default QuickCard;
