import React from "react";
import { Gift, Package2, ShoppingBag, ShieldCheck, Clock3, HandCoins, Tag, ReceiptText } from "lucide-react";
import { formatPrice } from "../../utils/helpers";

const OrderSummary = ({ items = [], totals = {} }) => {
  const packagingFee = Number(totals.packagingFee || 0) || 0;
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Bill details</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Your cart at a glance</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Package2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const quantity = Number(item.quantity || 1) || 1;
          const price = Number(item.price || 0) || 0;
          return (
            <article key={item.id} className="flex items-start gap-3 rounded-[18px] bg-slate-50 p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">{item.name}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  Qty {quantity}
                  {item.unit ? ` • ${item.unit}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-950">{formatPrice(price * quantity)}</p>
                <p className="text-[11px] font-semibold text-slate-400">{formatPrice(price)} each</p>
                {item.oldPrice ? <p className="text-[11px] font-semibold text-slate-400 line-through">{formatPrice(item.oldPrice * quantity)}</p> : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 rounded-[20px] bg-slate-50 p-4">
        <div className="space-y-2 text-sm font-semibold text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-slate-400" />
              Item total
            </span>
            <span className="font-black text-slate-950">{formatPrice(totals.subtotal || 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Delivery fee</span>
            <span className="font-black text-slate-950">
              {totals.deliveryFee ? formatPrice(totals.deliveryFee) : "FREE"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Packaging</span>
            <span className="font-black text-slate-950">{packagingFee > 0 ? formatPrice(packagingFee) : "FREE"}</span>
          </div>
          {Number(totals.discount || 0) > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-emerald-600" />
                Discount
              </span>
              <span className="font-black text-emerald-700">- {formatPrice(totals.discount)}</span>
            </div>
          ) : null}
          {totals.freeGift ? (
            <div className="flex items-center justify-between gap-3 text-emerald-700">
              <span className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Free gift
              </span>
              <span className="font-black">{totals.freeGift}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-base">
            <span className="font-black text-slate-700">Total</span>
            <span className="font-black text-slate-950">{formatPrice(totals.total || 0)}</span>
          </div>
        </div>
        <div className="mt-4 grid gap-2 rounded-[18px] bg-white p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Local delivery support
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Clock3 className="h-4 w-4 text-orange-500" />
            Fast village delivery
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <HandCoins className="h-4 w-4 text-emerald-600" />
            You save time with direct local handoff
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderSummary;
