import React from "react";
import { ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import { formatPrice } from "../../utils/helpers";

const CartSummary = ({
  totals = {},
  subtotal: subtotalProp = 0,
  deliveryFee: deliveryFeeProp = 0,
  discountAmount: discountAmountProp = 0,
  total: totalProp = 0,
  deliveryVillage = "Azampur",
  deliveryEstimate = "10 min",
  onCheckout,
  onWhatsAppCheckout,
}) => {
  const subtotal = totals.subtotal ?? subtotalProp ?? 0;
  const deliveryFee = totals.deliveryFee ?? deliveryFeeProp ?? 0;
  const packagingFee = totals.packagingFee ?? 0;
  const discountAmount = totals.discount ?? discountAmountProp ?? 0;
  const total = totals.total ?? totalProp ?? 0;
  const freeGift = totals.freeGift;

  return (
    <section className="sticky bottom-20 z-20 rounded-[20px] bg-white p-4 shadow-xl shadow-emerald-950/10 ring-1 ring-slate-100">
      <div className="mb-3 flex items-center gap-2 rounded-[16px] bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-slate-100">
        <Clock3 className="h-4 w-4" />
        <span>Delivery estimate: {deliveryEstimate} to {deliveryVillage}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-500">
          <span>Item total</span>
          <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Delivery fee</span>
          <span className="font-bold text-emerald-700">{deliveryFee > 0 ? formatPrice(deliveryFee) : "FREE"}</span>
        </div>
        <div className="flex items-center justify-between text-slate-500">
          <span>Packaging</span>
          <span className="font-bold text-emerald-700">{packagingFee > 0 ? formatPrice(packagingFee) : "FREE"}</span>
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
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Grand Total</p>
          <p className="text-xl font-black text-slate-950">{formatPrice(total)}</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Pay on delivery</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-black text-slate-500">
        <span className="rounded-[14px] bg-emerald-50 px-2 py-2 text-emerald-700">COD</span>
        <span className="rounded-[14px] bg-orange-50 px-2 py-2 text-orange-700">Local</span>
        <span className="rounded-[14px] bg-slate-50 px-2 py-2">Fast</span>
      </div>

      {freeGift ? (
        <div className="mt-3 rounded-[16px] bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100">
          Free gift: {freeGift}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onCheckout || onWhatsAppCheckout}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-orange-500 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
};

export default CartSummary;
