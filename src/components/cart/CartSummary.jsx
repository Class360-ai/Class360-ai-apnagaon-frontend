import React from "react";
import { ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import { formatPrice } from "../../utils/helpers";

const CartSummary = ({
  subtotal = 0,
  deliveryFee = 0,
  discountAmount = 0,
  total = 0,
  deliveryVillage = "Azampur",
  deliveryEstimate = "10 min",
  onCheckout,
  onWhatsAppCheckout,
}) => {
  return (
    <section className="sticky bottom-20 z-20 rounded-[28px] bg-white p-4 shadow-xl shadow-emerald-950/10 ring-1 ring-slate-100">
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
        <Clock3 className="h-4 w-4" />
        <span>Delivery estimate: {deliveryEstimate} to {deliveryVillage}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span>Subtotal</span>
          <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Delivery fee</span>
          <span className="font-bold text-emerald-700">{deliveryFee > 0 ? formatPrice(deliveryFee) : "FREE"}</span>
        </div>
        {discountAmount > 0 ? (
          <div className="flex items-center justify-between text-slate-500">
            <span>Discount / Reward</span>
            <span className="font-bold text-emerald-700">- {formatPrice(discountAmount)}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Final Total</p>
          <p className="text-xl font-black text-slate-950">{formatPrice(total)}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Pay on delivery</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-black text-slate-500">
        <span className="rounded-2xl bg-emerald-50 px-2 py-2 text-emerald-700">COD available</span>
        <span className="rounded-2xl bg-orange-50 px-2 py-2 text-orange-700">Local delivery</span>
        <span className="rounded-2xl bg-slate-50 px-2 py-2">Fast village delivery</span>
      </div>

      <button
        type="button"
        onClick={onCheckout || onWhatsAppCheckout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
};

export default CartSummary;
