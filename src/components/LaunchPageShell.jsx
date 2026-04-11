import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LaunchPageShell = ({
  title,
  subtitle,
  eyebrow = "ApnaGaon",
  icon: Icon,
  highlights = [],
  children,
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gradient-to-b from-emerald-50 via-orange-50/40 to-slate-50 pb-28 ${className}`}>
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm ring-1 ring-emerald-100">
            Launch ready
          </span>
        </div>

        <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-gray-100">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-5 text-white">
            <div className="flex items-start gap-3">
              {Icon ? (
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Icon className="h-6 w-6" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">{eyebrow}</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight">{title}</h1>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/90">{subtitle}</p>
              </div>
            </div>

            {highlights.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white ring-1 ring-white/15"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 p-4">{children}</div>
        </section>
      </div>
    </div>
  );
};

export default LaunchPageShell;
