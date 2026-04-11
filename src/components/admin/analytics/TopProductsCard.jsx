import React from "react";
import { PackageSearch } from "lucide-react";
import { formatPrice } from "../../../utils/helpers";

const Section = ({ title, items = [], emptyLabel, accent = "emerald" }) => {
  const tone = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
    red: "bg-red-50 text-red-700 ring-red-100",
  }[accent];

  return (
    <div className="rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">{title}</p>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${tone}`}>{items.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={`${title}-${item.name}`} className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{item.name}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {item.orders ?? item.quantity ?? 0} orders · {formatPrice(item.revenue || 0)}
                  </p>
                </div>
                {item.stock !== undefined ? (
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${item.stock <= 0 ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>
                    {item.stock <= 0 ? "Out" : `Stock ${item.stock}`}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white p-3 text-xs font-semibold text-slate-500 ring-1 ring-slate-100">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
};

const TopProductsCard = ({
  topSellingProducts = [],
  mostAddedToCart = [],
  lowPerformingProducts = [],
  outOfStockProducts = [],
}) => (
  <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Products</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Product performance</h2>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <PackageSearch className="h-5 w-5" />
      </span>
    </div>

    <div className="mt-4 grid gap-3 xl:grid-cols-2">
      <Section title="Top selling products" items={topSellingProducts} emptyLabel="No sold products yet." accent="emerald" />
      <Section title="Most added to cart" items={mostAddedToCart} emptyLabel="No cart history yet." accent="orange" />
      <Section title="Low performing" items={lowPerformingProducts} emptyLabel="No low-performing products yet." accent="slate" />
      <Section title="Out of stock" items={outOfStockProducts} emptyLabel="No out-of-stock items." accent="red" />
    </div>
  </section>
);

export default TopProductsCard;
