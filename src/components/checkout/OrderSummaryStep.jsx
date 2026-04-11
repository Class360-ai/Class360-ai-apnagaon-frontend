import React, { useMemo, useState } from "react";
import { Package, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import AddressCard from "./AddressCard";
import DeliveryInfoCard from "./DeliveryInfoCard";
import PriceSummaryCard from "./PriceSummaryCard";
import { formatPrice } from "../../utils/helpers";
import { getDeliveryEstimate } from "../../utils/locationHelpers";

const copy = {
  en: {
    title: "Order Summary",
    subtitle: "Step 2 of 3",
    details: "Review your delivery details, items, and total before payment.",
    itemsTitle: "Cart items",
    trustTitle: "Trust & help",
    note: "Easy doorstep delivery with local support whenever you need it.",
    savings: "You saved ₹20 today",
    freeDelivery: "Free delivery above ₹199",
    reward: "Apply reward now",
    emptyTitle: "Your cart is empty",
    emptyDesc: "Add a few items to continue to payment.",
    backToCart: "Back to Cart",
    shopNow: "Shop Now",
    noAddressTitle: "Select a delivery address",
    noAddressDesc: "Please choose or save an address to continue.",
    addressCta: "Go to Address",
    deliveryEta: "Delivery ETA",
    payable: "Payable now",
    continue: "Continue to Payment",
    addressLabel: "Delivery to",
    addressHint: "Tap change if you want a different delivery spot.",
    available: "100% Secure • COD Available • WhatsApp support available",
    helpLine: "WhatsApp confirmation available",
  },
  hi: {
    title: "ऑर्डर सारांश",
    subtitle: "चरण 2 में से 3",
    details: "भुगतान से पहले delivery details, items, और total review करें।",
    itemsTitle: "Cart items",
    trustTitle: "भरोसा और सहायता",
    note: "आसानी से doorstep delivery, और ज़रूरत पर local support।",
    savings: "आज आपने ₹20 बचाए",
    freeDelivery: "₹199 से ऊपर फ्री डिलीवरी",
    reward: "Reward अभी लगाएँ",
    emptyTitle: "आपका cart खाली है",
    emptyDesc: "Payment पर जाने से पहले कुछ items जोड़ें।",
    backToCart: "Cart पर लौटें",
    shopNow: "Shop Now",
    noAddressTitle: "डिलीवरी पता चुनें",
    noAddressDesc: "आगे बढ़ने के लिए पता चुनें या सहेजें।",
    addressCta: "Address पर जाएँ",
    deliveryEta: "डिलीवरी समय",
    payable: "अभी देय",
    continue: "Payment पर जाएँ",
    addressLabel: "डिलीवरी जाएगी",
    addressHint: "अगर अलग पता चाहिए तो Change दबाएँ।",
    available: "100% सुरक्षित • COD उपलब्ध • WhatsApp सहायता उपलब्ध",
    helpLine: "WhatsApp confirmation उपलब्ध",
  },
};

const isValidAddress = (address = {}) => Boolean(address?.id && address.source !== "default");

const normalizePrice = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getItemsSubtotal = (list = []) =>
  (Array.isArray(list) ? list : []).reduce(
    (sum, item) => sum + normalizePrice(item?.price) * Math.max(1, normalizePrice(item?.quantity) || 1),
    0
  );

const SummaryItemCard = ({ item, lang = "en" }) => {
  const [imageError, setImageError] = useState(false);
  const quantity = Math.max(1, normalizePrice(item?.quantity) || 1);
  const unitPrice = normalizePrice(item?.price);
  const totalPrice = unitPrice * quantity;
  const hasDiscount = normalizePrice(item?.originalPrice) > unitPrice;
  const discountAmount = hasDiscount ? normalizePrice(item.originalPrice) * quantity - totalPrice : 0;

  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-slate-50 p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
        {item?.image && !imageError ? (
          <img
            src={item.image}
            alt={item?.name || "Item"}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Package className="h-6 w-6 text-slate-400" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black text-slate-950">{item?.name || (lang === "hi" ? "Item" : "Item")}</h3>
        <p className="truncate text-xs font-semibold text-slate-500">
          {item?.unit || item?.subtitle || item?.categoryName || (lang === "hi" ? "उपलब्ध item" : "Daily essential")}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="rounded-full bg-white px-2 py-1 text-slate-600 ring-1 ring-slate-100">
            Qty {quantity}
          </span>
          {hasDiscount ? (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-emerald-100">
              Save {formatPrice(discountAmount)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-slate-950">{formatPrice(totalPrice)}</p>
        {hasDiscount ? <p className="text-[11px] font-semibold text-slate-400 line-through">{formatPrice(normalizePrice(item.originalPrice) * quantity)}</p> : null}
      </div>
    </div>
  );
};

const SummaryHelpCard = ({ lang = "en" }) => {
  const text = copy[lang] || copy.en;
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black text-slate-950">{text.trustTitle}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">{text.note}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black text-slate-600">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{lang === "hi" ? "100% सुरक्षित" : "100% Secure"}</span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">{lang === "hi" ? "COD उपलब्ध" : "Cash on Delivery Available"}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{lang === "hi" ? "तेज़ गाँव डिलीवरी" : "Fast village delivery"}</span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">{text.helpLine}</span>
      </div>
    </section>
  );
};

const OrderSummaryStep = ({ lang = "en", address, items, pricing, rewardLabel, deliveryEstimate, onChangeAddress, onContinue, onBackToCart }) => {
  const text = copy[lang] || copy.en;
  const safeItems = Array.isArray(items) ? items : [];
  const hasItems = safeItems.length > 0;
  const hasAddress = isValidAddress(address);
  const computedSubtotal = getItemsSubtotal(safeItems);
  const eta = deliveryEstimate || getDeliveryEstimate(address?.distanceKm || 3) || "20 min";

  const safePricing = useMemo(() => {
    const subtotal = normalizePrice(pricing?.subtotal ?? computedSubtotal);
    const deliveryFee = normalizePrice(pricing?.deliveryFee ?? 0);
    const serviceFee = normalizePrice(pricing?.serviceFee ?? 0);
    const discount = normalizePrice(pricing?.discount ?? 0);
    const total = Math.max(0, normalizePrice(pricing?.total ?? subtotal + deliveryFee + serviceFee - discount));
    return { subtotal, deliveryFee, serviceFee, discount, total };
  }, [computedSubtotal, pricing]);

  const rewardText = rewardLabel || (safePricing.discount > 0 ? text.reward : "");

  if (!hasItems) {
    return (
      <div className="space-y-4 pb-28">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-4 text-white">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">{text.subtitle}</p>
            <h1 className="mt-1 text-3xl font-black">{text.title}</h1>
            <p className="mt-2 text-sm font-semibold text-white/90">{text.details}</p>
          </div>
          <div className="p-4">
            <div className="rounded-[24px] bg-slate-50 p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-100">
                <Package className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-black text-slate-950">{text.emptyTitle}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{text.emptyDesc}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" onClick={onBackToCart} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100">
                  {text.backToCart}
                </button>
                <button type="button" onClick={onContinue} className="rounded-full bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200">
                  {text.shopNow}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-4 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">{text.subtitle}</p>
          <h1 className="mt-1 text-3xl font-black">{text.title}</h1>
          <p className="mt-2 text-sm font-semibold text-white/90">{text.details}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 text-center">
          <div className="rounded-[18px] bg-emerald-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">{lang === "hi" ? "सुरक्षित" : "Secure"}</p>
          </div>
          <div className="rounded-[18px] bg-orange-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-orange-700">{lang === "hi" ? "तेज़ डिलीवरी" : "Fast Delivery"}</p>
          </div>
          <div className="rounded-[18px] bg-slate-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-700">{lang === "hi" ? "WhatsApp सहायता" : "WhatsApp Help"}</p>
          </div>
        </div>
      </section>

      {hasAddress ? (
        <AddressCard
          lang={lang}
          address={address}
          selected
          actionLabel={lang === "hi" ? "बदलें" : "Change"}
          onAction={onChangeAddress}
        />
      ) : (
        <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs font-black uppercase tracking-wide text-amber-600">{text.noAddressTitle}</p>
          <p className="mt-1 text-sm font-semibold text-slate-600">{text.noAddressDesc}</p>
          <button
            type="button"
            onClick={onChangeAddress}
            className="mt-3 rounded-full bg-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-amber-100"
          >
            {text.addressCta}
          </button>
        </section>
      )}

      <DeliveryInfoCard lang={lang} eta={eta} />

      <section className="rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">{text.itemsTitle}</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">{lang === "hi" ? "जारी रखने से पहले अपने cart items की पुष्टि करें" : "Confirm the items in your cart before payment."}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
            {safeItems.length} {lang === "hi" ? "items" : "items"}
          </span>
        </div>

        <div className="mt-3 space-y-3">
          {safeItems.map((item) => (
            <SummaryItemCard key={item.id || item._id || item.name} item={item} lang={lang} />
          ))}
        </div>
      </section>

      <SummaryHelpCard lang={lang} />

      <section className="rounded-[24px] bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{text.savings}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{text.freeDelivery}</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-700" />
        </div>
        {rewardText ? <p className="mt-2 text-xs font-bold text-emerald-800">{rewardText}</p> : null}
      </section>

      <PriceSummaryCard
        lang={lang}
        subtotal={safePricing.subtotal}
        deliveryFee={safePricing.deliveryFee}
        serviceFee={safePricing.serviceFee}
        discount={safePricing.discount}
        rewardLabel={rewardText}
        total={safePricing.total}
      />

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-100 bg-white/95 p-4 shadow-[0_-12px_34px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{text.payable}</p>
            <p className="text-lg font-black text-slate-950">{formatPrice(safePricing.total)}</p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={!hasAddress || !hasItems}
            className="min-w-0 flex-1 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
          >
            {text.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryStep;
