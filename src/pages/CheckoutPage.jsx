import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock3, MapPin, MessageCircle, NotebookPen, ShieldCheck } from "lucide-react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import PaymentMethodSelector from "../components/checkout/PaymentMethodSelector";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { formatPrice } from "../utils/helpers";
import { createOrder } from "../services/orderService";
import { buildWhatsAppCheckoutLink } from "../utils/whatsappMessage";
import { generateWhatsAppOrderMessage } from "../utils/generateWhatsAppOrderMessage";
import { getLaunchBrandName } from "../utils/runtimeConfig";
import { createLocationSnapshot, formatLocationLabel, getCurrentLocation } from "../utils/location";
import { formatAddressLine, getSelectedAddress, normalizeAddress, saveSelectedAddress } from "../utils/locationHelpers";
import { getOrders as getLocalOrders } from "../utils/orderTracking";
import { calculateCartTotals } from "../utils/calculateCartTotals";

const DEFAULT_FORM = {
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
  notes: "",
};

const REQUIRED_FIELDS = ["fullName", "phone", "address"];
const DELIVERY_FEE = 0;

const isServiceCheckoutItem = (item = {}) =>
  item.cartType === "service" ||
  item.itemType === "service" ||
  item.type === "service" ||
  item.kind === "service";

const normalizeCheckoutItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map((item, index) => {
      const quantity = Math.max(1, Number(item.quantity || item.qty || 1) || 1);
      const price = Number(item.price || item.fee || 0) || 0;
      return {
        id: item.id || item._id || `${item.name || "item"}-${index}`,
        name: item.name || "Item",
        price,
        quantity,
        image: item.image || "",
        unit: item.unit || item.subtitle || item.categoryName || "",
      };
    });

const validateForm = (form, paymentMethod) => {
  const errors = {};
  REQUIRED_FIELDS.forEach((field) => {
    if (!String(form[field] || "").trim()) errors[field] = "This field is required";
  });
  const digits = String(form.phone || "").replace(/\D/g, "");
  if (digits.length !== 10) errors.phone = "Phone number must be 10 digits";
  if (!String(paymentMethod || "").trim()) errors.paymentMethod = "Please select a payment method";
  return errors;
};

const SelectedAddressCard = ({ address, onChangeAddress, onChangeOnMap }) => {
  if (!address) return null;

  const isCurrentLocation = address.source === "current" || address.label === "Current Location";
  const isMapPicked = address.source === "map-picker";
  const addressLine =
    isCurrentLocation
      ? address.area || address.house || "Current location selected"
      : [address.house, address.area, address.city, address.state, address.pincode].filter(Boolean).join(", ") ||
        address.address ||
        address.area ||
        "Address not set";

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Selected address</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">
            {isMapPicked ? "Pinned delivery location selected" : "Your delivery spot"}
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-black ${isMapPicked ? "bg-slate-950 text-white" : "bg-emerald-50 text-emerald-700"}`}>
          {isMapPicked ? "Map selected" : "Active"}
        </span>
      </div>

      <div className={`mt-4 rounded-[24px] p-4 ring-1 ${isMapPicked ? "bg-slate-50 ring-slate-100" : "bg-emerald-50 ring-emerald-100"}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-emerald-100">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-slate-950">{address.label || "Saved address"}</p>
              {isCurrentLocation ? <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700">GPS</span> : null}
              {isMapPicked ? <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-700">Map pinned</span> : null}
            </div>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{addressLine}</p>
            {address.fullName ? <p className="mt-2 text-xs font-bold text-slate-500">{address.fullName}</p> : null}
            {address.phone ? <p className="mt-1 text-xs font-bold text-slate-500">{address.phone}</p> : null}
            {Number.isFinite(Number(address.lat)) && Number.isFinite(Number(address.lon)) ? (
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                {Number(address.lat).toFixed(5)}, {Number(address.lon).toFixed(5)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onChangeAddress}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white"
        >
          Change Address
        </button>
        <button
          type="button"
          onClick={onChangeOnMap || onChangeAddress}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100"
        >
          {isMapPicked ? "Change on Map" : "Review Saved"}
        </button>
      </div>
    </section>
  );
};

const DeliveryDetailsCard = ({ note, onNoteChange, contactless, onContactlessChange, etaLabel }) => (
  <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery details</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Instructions for delivery</h2>
      </div>
      <div className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-600 ring-1 ring-slate-100">
        {etaLabel}
      </div>
    </div>

    <div className="mt-4 grid gap-3 rounded-[20px] bg-slate-50 p-4 ring-1 ring-slate-100">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Clock3 className="h-4 w-4 text-orange-500" />
        Estimated delivery in {etaLabel}
      </div>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
          <NotebookPen className="h-3.5 w-3.5 text-emerald-600" />
          <span>Delivery note</span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">Optional</span>
        </span>
        <textarea
          rows={3}
          value={note || ""}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Gate code, timing, call before arrival, etc."
          className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
        />
      </label>

      <button
        type="button"
        onClick={() => onContactlessChange?.(!contactless)}
        className={`flex items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-black transition ${
          contactless ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100" : "bg-white text-slate-700 ring-1 ring-slate-100"
        }`}
      >
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Contactless delivery
        </span>
        <span className="text-xs font-black uppercase tracking-wide">{contactless ? "On" : "Off"}</span>
      </button>
    </div>
  </section>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, appliedReward, coupon } = useCart();
  const { user } = useUser();
  const selectedAddress = useMemo(() => location.state?.selectedAddress || getSelectedAddress(), [location.state?.selectedAddress]);

  const checkoutItems = useMemo(() => {
    const sourceItems = location.state?.checkoutItems || cart;
    const filteredItems = Array.isArray(sourceItems) ? sourceItems.filter((item) => !isServiceCheckoutItem(item)) : [];
    return normalizeCheckoutItems(filteredItems);
  }, [cart, location.state?.checkoutItems]);

  const totals = useMemo(
    () =>
      calculateCartTotals(checkoutItems, {
        deliveryFee: DELIVERY_FEE,
        packagingFee: 0,
        appliedReward,
        coupon,
      }),
    [appliedReward, checkoutItems, coupon]
  );

  const [form, setForm] = useState(DEFAULT_FORM);
  const [addressType, setAddressType] = useState("home");
  const [contactless, setContactless] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [locationState, setLocationState] = useState(() => createLocationSnapshot({ locationSource: "manual" }));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user?.name || user?.fullName || "",
      phone: current.phone || user?.phone || "",
      address: current.address || user?.address || user?.village || "",
    }));
  }, [user]);

  useEffect(() => {
    const selected = location.state?.selectedAddress || getSelectedAddress();
    if (!selected) return;

    const normalized = normalizeAddress(selected);
    const normalizedLabel = String(normalized.label || "").toLowerCase();
    if (normalizedLabel.includes("work")) setAddressType("work");
    else if (normalizedLabel.includes("other")) setAddressType("other");
    else setAddressType("home");
    const addressLabel =
      normalized.source === "current" || normalized.label === "Current Location"
        ? normalized.area || normalized.label || "Current location selected"
        : formatAddressLine(normalized) || normalized.area || normalized.label || "";
    setForm((current) => ({
      ...current,
      fullName: current.fullName || normalized.fullName || user?.name || user?.fullName || "",
      phone: current.phone || normalized.phone || user?.phone || "",
      address: current.address || addressLabel,
      landmark: current.landmark || normalized.note || "",
    }));
    setLocationState(
      createLocationSnapshot({
        latitude: normalized.lat,
        longitude: normalized.lon,
        addressLabel,
        locationSource: normalized.source === "current" ? "gps" : normalized.source === "gps" ? "gps" : "manual",
      })
    );
  }, [location.state?.selectedAddress, user]);

  useEffect(() => {
    if (!checkoutItems.length) {
      navigate("/cart", { replace: true });
      return;
    }
    setBootstrapping(false);
  }, [checkoutItems.length, navigate]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitError("");
    if (field === "address") {
      setLocationState((current) => ({
        ...current,
        addressLabel: String(value || "").trim(),
        locationSource: current.latitude && current.longitude ? current.locationSource : "manual",
      }));
    }
  };

  const touchField = (field) => {
    setTouched((current) => ({ ...current, [field]: true }));
    if (REQUIRED_FIELDS.includes(field)) {
      const nextErrors = validateForm(form, paymentMethod);
      setErrors((current) => ({ ...current, [field]: nextErrors[field] || "" }));
    }
  };

  const resolveCustomer = () => ({
    name: String(form.fullName || user?.name || "ApnaGaon Customer").trim(),
    phone: String(form.phone || user?.phone || "").trim(),
    address: String(form.address || "").trim(),
    landmark: String(form.landmark || "").trim(),
    notes: String(form.notes || "").trim(),
  });

  const buildOrderBase = (status) => {
    const customer = resolveCustomer();
    const orderId = `AG${Date.now().toString().slice(-8)}`;
    const paymentLabel = paymentMethod === "upi" ? "UPI" : "Cash on Delivery";

    return {
      orderId,
      customerName: customer.name,
      phone: customer.phone,
      customer,
      address: {
        fullName: customer.name,
        phone: customer.phone,
        address: customer.address,
        landmark: customer.landmark,
        note: customer.notes,
        latitude: locationState.latitude,
        longitude: locationState.longitude,
        addressLabel: locationState.addressLabel || customer.address,
        locationSource: locationState.locationSource || "manual",
      },
      items: checkoutItems,
      totals,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      packagingFee: totals.packagingFee,
      discount: totals.discount,
      total: totals.total,
      latitude: locationState.latitude,
      longitude: locationState.longitude,
      addressLabel: locationState.addressLabel || customer.address,
      locationSource: locationState.locationSource || "manual",
      addressType,
      contactlessDelivery: contactless,
      paymentMethod: paymentLabel,
      paymentStatus: paymentMethod === "upi" ? "pending" : "cod_pending",
      status,
      source: status === "whatsapp_pending" ? "whatsapp" : "app",
      notes: customer.notes,
      landmark: customer.landmark,
      appliedReward: appliedReward || null,
      rewardUsed: appliedReward?.code || appliedReward?.name || null,
      coupon: coupon || null,
      couponCode: coupon?.code || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      meta: {
        checkoutType: status === "whatsapp_pending" ? "whatsapp" : "app",
        brandName: getLaunchBrandName(),
      },
    };
  };

  const handleValidation = () => {
    setHasAttemptedSubmit(true);
    setTouched((current) => ({
      ...current,
      fullName: true,
      phone: true,
      address: true,
    }));
    const nextErrors = validateForm(form, paymentMethod);
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      setSubmitError(
        firstError === "paymentMethod"
          ? "Please select a payment method to continue."
          : "Please complete Full Name, Phone Number, and Full Address to continue."
      );
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleUseCurrentLocation = async () => {
    setLocationState((current) => ({ ...current, loading: true, message: "Fetching location..." }));
    setSubmitError("");

    try {
      const currentLocation = await getCurrentLocation();
      const label = formatLocationLabel(currentLocation);
      setLocationState({
        ...currentLocation,
        addressLabel: currentLocation.addressLabel || "Current location selected",
        message: `Location selected successfully${label ? ` - ${label}` : ""}`,
        loading: false,
      });
      saveSelectedAddress(
        normalizeAddress({
          label: "Current Location",
          fullName: form.fullName || user?.name || "",
          phone: form.phone || user?.phone || "",
          house: currentLocation.addressLabel || "Current location selected",
          area: currentLocation.addressLabel || "Current location selected",
          lat: currentLocation.latitude,
          lon: currentLocation.longitude,
          source: "current",
        })
      );
      setForm((current) => ({
        ...current,
        address: currentLocation.addressLabel || "Current location selected",
      }));
    } catch (error) {
      const message =
        error?.code === 1
          ? "Location allow karein for faster checkout, ya manually address enter karein"
          : error?.message === "geolocation_unavailable"
            ? "This device does not support location access."
            : "We could not fetch your location right now. Please enter the address manually.";
      setLocationState((current) => ({ ...current, loading: false, message, locationSource: "manual" }));
      setSubmitError(message);
    }
  };

  const handleWhatsAppOrder = async () => {
    if (!handleValidation()) return;

    setWhatsappLoading(true);
    setSubmitError("");

    try {
      const orderPayload = buildOrderBase("whatsapp_pending");
      console.debug("[Checkout] whatsapp order payload before save:", orderPayload);
      const savedOrder = await createOrder(orderPayload);
      console.debug("[Checkout] local orders after whatsapp save:", getLocalOrders());
      const customer = resolveCustomer();
      const message = generateWhatsAppOrderMessage({
        orderId: savedOrder.orderId || savedOrder.id,
        customerName: customer.name,
        phone: customer.phone,
        address: customer.address,
        landmark: customer.landmark,
        notes: customer.notes,
        items: checkoutItems,
        totals,
        paymentMethod: paymentMethod === "upi" ? "UPI" : "Cash on Delivery",
        source: "whatsapp",
      });
      const whatsappLink = buildWhatsAppCheckoutLink(message);
      if (!whatsappLink || whatsappLink === "javascript:void(0)") {
        throw new Error("Could not create WhatsApp link");
      }
      window.location.assign(whatsappLink);
    } catch (error) {
      setSubmitError(error?.message || "Unable to open WhatsApp checkout right now.");
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!handleValidation()) return;

    setAppLoading(true);
    setSubmitError("");

    try {
      const orderPayload = buildOrderBase("placed");
      console.debug("[Checkout] app order payload before save:", orderPayload);
      const savedOrder = await createOrder(orderPayload);
      console.debug("[Checkout] local orders after app save:", getLocalOrders());
      navigate(`/order-success/${savedOrder.orderId || savedOrder.id}`, {
        state: { success: true, orderId: savedOrder.orderId || savedOrder.id, order: savedOrder },
      });
    } catch (error) {
      setSubmitError(error?.message || "Unable to place the order in the app.");
    } finally {
      setAppLoading(false);
    }
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-24 animate-pulse rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100" />
          <div className="h-56 animate-pulse rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-40 pt-4">
      <main className="mx-auto max-w-md space-y-4">
        <div className="flex items-center gap-3 rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl bg-slate-50 p-2.5 text-slate-700 ring-1 ring-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">ApnaGaon Checkout</p>
            <h1 className="text-lg font-black text-slate-950">Checkout</h1>
          </div>
        </div>

        <SelectedAddressCard
          address={
            selectedAddress
              ? normalizeAddress(selectedAddress)
              : locationState.latitude && locationState.longitude
                ? {
                    label: locationState.addressLabel || "Current Location",
                    area: locationState.addressLabel || "Current location selected",
                    source: locationState.locationSource || "manual",
                    lat: locationState.latitude,
                    lon: locationState.longitude,
                    fullName: form.fullName || user?.name || "",
                    phone: form.phone || user?.phone || "",
                  }
                : null
          }
          onChangeAddress={() =>
            navigate("/select-address", {
              state: {
                returnTo: "/checkout",
                checkoutState: location.state || {},
              },
            })
          }
          onChangeOnMap={() =>
            navigate("/map-picker", {
              state: {
                returnTo: "/checkout",
                checkoutState: location.state || {},
                selectedAddress: selectedAddress ? normalizeAddress(selectedAddress) : null,
              },
            })
          }
        />

        <CheckoutForm
          form={form}
          errors={errors}
          touched={touched}
          onChange={updateField}
          onBlur={touchField}
          onUseCurrentLocation={handleUseCurrentLocation}
          onChangeAddress={() =>
            navigate("/select-address", {
              state: {
                returnTo: "/checkout",
                checkoutState: location.state || {},
              },
            })
          }
          addressType={addressType}
          onAddressTypeChange={setAddressType}
          locationState={locationState}
          showErrors={hasAttemptedSubmit}
          submitError={submitError}
        />

        <DeliveryDetailsCard
          note={form.notes}
          onNoteChange={(value) => updateField("notes", value)}
          contactless={contactless}
          onContactlessChange={setContactless}
          etaLabel={`${locationState.latitude && locationState.longitude ? "20-30 min" : "30 min"}`}
        />

        <OrderSummary items={checkoutItems} totals={totals} />

        <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} error={hasAttemptedSubmit ? errors.paymentMethod : ""} />

        <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-950">Safe local ordering</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Easy support on WhatsApp and secure order confirmation.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleWhatsAppOrder}
            disabled={whatsappLoading || appLoading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 disabled:opacity-70"
          >
            <MessageCircle className="h-4 w-4" />
            {whatsappLoading ? "Opening WhatsApp..." : "Order on WhatsApp"}
          </button>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">Pay on WhatsApp later if you prefer the chat confirmation flow.</p>
        </section>
      </main>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-slate-200 bg-white/96 px-4 py-3 shadow-[0_-12px_32px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Total payable</p>
            <p className="text-lg font-black text-slate-950">{formatPrice(totals.total)}</p>
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={whatsappLoading || appLoading}
            className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(249,115,22,0.22)] disabled:bg-orange-300"
          >
            {appLoading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
