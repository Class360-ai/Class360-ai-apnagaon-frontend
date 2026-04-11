import React from "react";
import { Clock, PackageOpen, ShoppingBag, Sparkles, Wrench } from "lucide-react";

const EmptyCartState = ({ activeTab = "grocery", hasRewards = false, onShopGrocery, onExploreServices, onFastDelivery }) => {
  const isServices = activeTab === "services";

  return (
    <section className="rounded-[28px] bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
      <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-50 via-white to-orange-50 ring-1 ring-emerald-100">
        {isServices ? (
          <Wrench className="h-12 w-12 text-emerald-600" strokeWidth={1.7} />
        ) : (
          <PackageOpen className="h-12 w-12 text-emerald-600" strokeWidth={1.7} />
        )}
      </div>

      <h2 className="text-xl font-black text-slate-950">
        {isServices ? "No services added yet" : "Your cart is empty"}
      </h2>
      <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
        {isServices ? "Book village services or send inquiries to continue" : "Add daily essentials or services to continue"}
      </p>

      {hasRewards ? (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">
          <Sparkles className="h-4 w-4" />
          <span>You have rewards available</span>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={onShopGrocery}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-emerald-200"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Shop Grocery</span>
        </button>
        <button
          type="button"
          onClick={onExploreServices}
          className="flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-3 text-sm font-black text-emerald-700"
        >
          <Wrench className="h-4 w-4" />
          <span>Explore Services</span>
        </button>
        <button
          type="button"
          onClick={onFastDelivery}
          className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-md shadow-orange-100"
        >
          <Clock className="h-4 w-4" />
          <span>10 Minute Delivery</span>
        </button>
      </div>
    </section>
  );
};

export default EmptyCartState;
