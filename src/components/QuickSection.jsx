import React from "react";

const toneClassMap = {
  default: "bg-white ring-slate-100",
  delivery: "bg-white ring-emerald-100",
  emergency: "bg-gradient-to-b from-rose-50 to-rose-100/80 ring-rose-200",
  combo: "bg-gradient-to-b from-white to-amber-50/70 ring-amber-100",
};

const QuickSection = ({
  title,
  subtitle,
  tone = "default",
  horizontal = false,
  children,
  className = "",
}) => {
  const sectionTitle = typeof title === "string" && title.trim() ? title.trim() : "Section";
  const sectionSubtitle = typeof subtitle === "string" ? subtitle.trim() : "";
  const toneClass = toneClassMap[tone] || toneClassMap.default;

  return (
    <section className={`ag-quick-section rounded-[22px] p-[18px] shadow-[0_10px_28px_rgba(2,6,23,0.05)] ring-1 ${toneClass} ${className}`.trim()}>
      <div className="mb-3.5">
        <h2 className="text-base font-extrabold tracking-tight text-slate-900">{sectionTitle}</h2>
        {sectionSubtitle ? <p className="mt-1 text-xs font-medium text-slate-500">{sectionSubtitle}</p> : null}
      </div>

      {horizontal ? (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default QuickSection;
