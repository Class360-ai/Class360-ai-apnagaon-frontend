import React, { useState } from "react";
import { Tag } from "lucide-react";

const copy = {
  en: {
    title: "Apply reward now",
    hide: "Hide",
    show: "Apply",
    applied: "applied",
    placeholder: "APNA10",
    button: "Apply",
    helper: "Try APNA10, FREEDEL, or TEAGIFT",
  },
  hi: {
    title: "Reward अभी लगाएँ",
    hide: "छुपाएँ",
    show: "लागू करें",
    applied: "लागू हुआ",
    placeholder: "APNA10",
    button: "लागू करें",
    helper: "APNA10, FREEDEL, या TEAGIFT आज़माएँ",
  },
};

const CouponBox = ({ lang = "en", appliedCoupon, onApplyCoupon, onRemoveCoupon }) => {
  const text = copy[lang] || copy.en;
  const [open, setOpen] = useState(Boolean(appliedCoupon));
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const apply = () => {
    const result = onApplyCoupon?.(code);
    if (!result?.ok) {
      setError(result?.message || "Invalid coupon code");
      return;
    }
    setError("");
    setCode("");
    setOpen(true);
  };

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-2 text-sm font-black text-slate-950">
          <Tag className="h-4 w-4 text-orange-500" />
          {text.title}
        </span>
        <span className="text-xs font-black text-emerald-700">{open ? text.hide : text.show}</span>
      </button>

      {appliedCoupon ? (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
          <span>{appliedCoupon.code} {text.applied}</span>
          <button type="button" onClick={onRemoveCoupon} className="text-slate-500">Remove</button>
        </div>
      ) : null}

      {open && !appliedCoupon ? (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError("");
              }}
              placeholder={text.placeholder}
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-400"
            />
            <button type="button" onClick={apply} className="rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-emerald-100">
              {text.button}
            </button>
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-400">{text.helper}</p>
          {error ? <p className="mt-2 text-xs font-bold text-red-500">{error}</p> : null}
        </div>
      ) : null}
    </section>
  );
};

export default CouponBox;
