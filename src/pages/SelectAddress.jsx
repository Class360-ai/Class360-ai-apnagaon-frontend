import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Home, LocateFixed, MapPin, MessageCircle, Plus, Search, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { getWhatsAppLink } from "../utils/whatsappUtils";
import { getCurrentLocation } from "../utils/location";
import { createAddressId, getSavedAddresses, getSelectedAddress, normalizeAddress, saveSelectedAddress } from "../utils/locationHelpers";
import { getRecentAddressSearches, saveRecentAddressSearch } from "../utils/addressSelectionStorage";
import { getRecentMapPicks } from "../utils/mapLocation";

const EMPTY_FORM = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  landmark: "",
};

const renderAddressText = (address = {}) =>
  address.source === "current"
    ? `${address.label || address.area || "Current location selected"}${Number.isFinite(Number(address.lat)) && Number.isFinite(Number(address.lon)) ? ` (${Number(address.lat).toFixed(5)}, ${Number(address.lon).toFixed(5)})` : ""}`
    : [address.house, address.area, address.city, address.state, address.pincode].filter(Boolean).join(", ") ||
      address.address ||
      address.area ||
      address.city ||
      "Address unavailable";

const SelectAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/checkout";
  const checkoutState = location.state?.checkoutState || {};
  const [savedAddresses, setSavedAddresses] = useState(() => getSavedAddresses());
  const [recentSearches, setRecentSearches] = useState(() => getRecentAddressSearches());
  const [recentMapPicks, setRecentMapPicks] = useState(() => getRecentMapPicks());
  const [selectedId, setSelectedId] = useState(() => getSelectedAddress()?.id || location.state?.selectedAddress?.id || "");
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [manualForm, setManualForm] = useState(EMPTY_FORM);
  const [manualErrors, setManualErrors] = useState({});

  const selectedAddress = useMemo(() => location.state?.selectedAddress || getSelectedAddress(), [location.state?.selectedAddress]);

  useEffect(() => {
    const syncStorage = () => {
      setSavedAddresses(getSavedAddresses());
      setRecentSearches(getRecentAddressSearches());
      setRecentMapPicks(getRecentMapPicks());
    };

    syncStorage();
    window.addEventListener("storage", syncStorage);
    return () => window.removeEventListener("storage", syncStorage);
  }, []);

  useEffect(() => {
    if (selectedAddress?.id) setSelectedId(selectedAddress.id);
  }, [selectedAddress?.id]);

  const filteredSavedAddresses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return savedAddresses;
    return savedAddresses.filter((address) =>
      [
        address.label,
        address.fullName,
        address.area,
        address.city,
        address.house,
        renderAddressText(address),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [query, savedAddresses]);

  const applySelection = (address, recentLabel = "") => {
    const normalized = saveSelectedAddress(address);
    saveRecentAddressSearch({
      label: recentLabel || normalized.label || normalized.area || normalized.city || "Selected address",
      query: recentLabel || normalized.label || normalized.area || normalized.city || "Selected address",
      addressId: normalized.id,
    });
    setSelectedId(normalized.id);
    setStatusMessage("Address selected successfully");
    navigate(returnTo, {
      state: {
        ...checkoutState,
        selectedAddress: normalized,
      },
    });
  };

  const handleCardSelect = (address) => {
    applySelection(address, address.label || address.area || address.city || "Saved address");
  };

  const handleUseCurrentLocation = async () => {
    setLoadingLocation(true);
    setErrorMessage("");
    setStatusMessage("");
    try {
      const current = await getCurrentLocation();
      const saved = saveSelectedAddress(
        normalizeAddress({
          id: createAddressId(),
          label: "Current Location",
          fullName: "Current Location",
          house: current.addressLabel || "Current location selected",
          area: current.addressLabel || "Current location selected",
          lat: current.latitude,
          lon: current.longitude,
          source: "current",
        })
      );
      saveRecentAddressSearch({
        label: saved.area || saved.label || "Current Location",
        query: saved.area || saved.label || "Current Location",
        addressId: saved.id,
      });
      setSelectedId(saved.id);
      setStatusMessage("Current location saved and selected");
      navigate(returnTo, {
        state: {
          ...checkoutState,
          selectedAddress: saved,
        },
      });
    } catch (error) {
      setErrorMessage("Please allow location or pick a saved address.");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRequestAddress = () => {
    const message = [
      "Namaste ApnaGaon 🙏",
      "",
      "Mujhe address add karne mein help chahiye.",
      "Kripya meri location confirm kar dein.",
    ].join("\n");
    const link = getWhatsAppLink(message);
    window.location.assign(link);
  };

  const handlePickOnMap = () => {
    navigate("/map-picker", {
      state: {
        returnTo: "/select-address",
        checkoutState: checkoutState,
        selectedAddress,
      },
    });
  };

  const updateManual = (key, value) => {
    setManualForm((current) => ({ ...current, [key]: value }));
    setManualErrors((current) => ({ ...current, [key]: "" }));
  };

  const validateManual = () => {
    const nextErrors = {};
    ["fullName", "phone", "address"].forEach((key) => {
      if (!String(manualForm[key] || "").trim()) nextErrors[key] = "Required";
    });
    const digits = String(manualForm.phone || "").replace(/\D/g, "");
    if (digits.length !== 10) nextErrors.phone = "Phone must be 10 digits";
    setManualErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveManual = () => {
    if (!validateManual()) return;
    const saved = saveSelectedAddress(
      normalizeAddress({
        id: createAddressId(),
        label: manualForm.label || "Home",
        fullName: manualForm.fullName,
        phone: manualForm.phone,
        house: manualForm.address,
        area: manualForm.landmark || manualForm.address,
        note: manualForm.landmark || "",
        source: "manual",
      })
    );
    saveRecentAddressSearch({
      label: saved.label || saved.area || saved.city || "Manual address",
      query: saved.area || saved.house || saved.label || "Manual address",
      addressId: saved.id,
    });
    setShowAddForm(false);
    setSelectedId(saved.id);
    setStatusMessage("Address saved and selected");
    navigate(returnTo, {
      state: {
        ...checkoutState,
        selectedAddress: saved,
      },
    });
  };

  const handleRecentSelect = (recent) => {
    const match = savedAddresses.find((address) => address.id === recent.addressId);
    if (match) {
      handleCardSelect(match);
      return;
    }
    setQuery(recent.query || recent.label || "");
  };

  const handleQuerySubmit = (event) => {
    event.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    saveRecentAddressSearch({ label: clean, query: clean });
    setRecentSearches(getRecentAddressSearches());
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#f8fafc_55%,_#ecfdf5)] px-4 pb-28 pt-4">
      <main className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Addresses</p>
            <h1 className="truncate text-lg font-black text-slate-950">Select Address</h1>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-600 p-1 shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
          <div className="rounded-[31px] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Smart delivery setup</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Pick the right village address</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Saved addresses, current location, and quick WhatsApp help in one clean screen.
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50">
                <Home className="h-6 w-6" />
              </span>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-[20px] bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800 ring-1 ring-orange-100">
                {errorMessage}
              </div>
            ) : null}
            {statusMessage ? (
              <div className="mt-4 rounded-[20px] bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                {statusMessage}
              </div>
            ) : null}

            <form onSubmit={handleQuerySubmit} className="mt-4 rounded-[24px] bg-slate-50 p-3 ring-1 ring-slate-100">
              <label className="flex items-center gap-2 rounded-[20px] bg-white px-4 py-3 ring-1 ring-slate-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search village, lane, home name..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>
            </form>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={loadingLocation}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-[0_16px_32px_rgba(16,185,129,0.26)] disabled:bg-emerald-300"
              >
                <LocateFixed className="h-4 w-4" />
                {loadingLocation ? "Fetching..." : "Use Current Location"}
              </button>
              <button
                type="button"
                onClick={handlePickOnMap}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100"
              >
                <MapPin className="h-4 w-4" />
                Pick on Map
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm((current) => !current)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add New Address
              </button>
              <button
                type="button"
                onClick={handleRequestAddress}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 ring-1 ring-orange-100"
              >
                <MessageCircle className="h-4 w-4" />
                Request Address
              </button>
            </div>
          </div>
        </section>

        {showAddForm ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h2 className="text-lg font-black text-slate-950">Add New Address</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <select
                value={manualForm.label}
                onChange={(event) => updateManual("label", event.target.value)}
                className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
              {[
                ["fullName", "Full Name"],
                ["phone", "Phone Number"],
                ["address", "Full Address / Village"],
                ["landmark", "Landmark"],
              ].map(([key, placeholder]) => (
                <div key={key}>
                  <input
                    value={manualForm[key]}
                    onChange={(event) => updateManual(key, event.target.value)}
                    placeholder={placeholder}
                    className={`w-full rounded-[18px] border bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none ${
                      manualErrors[key] ? "border-red-300" : "border-slate-200"
                    }`}
                    type={key === "phone" ? "tel" : "text"}
                    inputMode={key === "phone" ? "tel" : "text"}
                  />
                  {manualErrors[key] ? <p className="mt-1 text-xs font-bold text-red-500">{manualErrors[key]}</p> : null}
                </div>
              ))}
              <button
                type="button"
                onClick={handleSaveManual}
                className="rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white"
              >
                Save Address
              </button>
            </div>
          </section>
        ) : null}

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Saved addresses</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Choose one to continue</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">{filteredSavedAddresses.length} saved</span>
          </div>

          <div className="mt-4 grid gap-3">
            {filteredSavedAddresses.length ? (
              filteredSavedAddresses.map((address) => {
                const isSelected = selectedId === address.id;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => handleCardSelect(address)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl ${isSelected ? "bg-white text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                          <MapPin className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-950">{address.label || "Saved address"}</p>
                            {isSelected ? <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">Selected</span> : null}
                            {address.source === "map-picker" ? <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-black text-white">Map selected</span> : null}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-slate-700">{address.fullName || "ApnaGaon Customer"}</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{renderAddressText(address)}</p>
                          {address.source === "current" ? <p className="mt-1 text-[11px] font-bold text-emerald-700">GPS location</p> : null}
                          {address.phone ? <p className="mt-1 text-xs font-bold text-slate-500">{address.phone}</p> : null}
                        </div>
                      </div>
                      <CheckCircle2 className={`mt-1 h-5 w-5 ${isSelected ? "text-emerald-600" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState
                title="No saved addresses yet"
                description="Add your home, work, or current location to make checkout faster next time."
                action={() => setShowAddForm(true)}
                actionText="Add Address"
              />
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-orange-600" />
            <h2 className="text-lg font-black text-slate-950">Recently searched</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.length ? (
              recentSearches.map((recent) => (
                <button
                  key={recent.id}
                  type="button"
                  onClick={() => handleRecentSelect(recent)}
                  className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-100"
                >
                  {recent.label}
                </button>
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-500">No recent searches yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-950">Recently picked on map</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentMapPicks.length ? (
              recentMapPicks.slice(0, 3).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    const match = savedAddresses.find((address) => address.id === entry.id);
                    if (match) {
                      handleCardSelect(match);
                      return;
                    }
                    setQuery(entry.label || "");
                  }}
                  className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100"
                >
                  {entry.label}
                </button>
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-500">No map-picked locations yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SelectAddress;
