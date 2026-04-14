import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, LocateFixed, MapPin, Search, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DEFAULT_ADDRESS, getSelectedAddress as getSavedSelectedAddress, normalizeAddress } from "../utils/locationHelpers";
import { geocodeSearch, getCurrentPositionAsync, reverseGeocode, savePickedAddress } from "../utils/mapLocation";
import { getRecentMapPicks } from "../utils/mapLocation";

const DEFAULT_CENTER = [DEFAULT_ADDRESS.lat, DEFAULT_ADDRESS.lon];

const MapSync = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const MapListener = ({ onMove }) => {
  useMapEvents({
    moveend(event) {
      const next = event.target.getCenter();
      onMove([next.lat, next.lng]);
    },
  });
  return null;
};

const MapPicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/select-address";
  const checkoutState = location.state?.checkoutState || {};
  const existingAddress = location.state?.selectedAddress || getSavedSelectedAddress() || DEFAULT_ADDRESS;

  const initialCenter = useMemo(() => {
    const lat = Number(existingAddress.lat ?? existingAddress.latitude);
    const lng = Number(existingAddress.lon ?? existingAddress.lng ?? existingAddress.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return DEFAULT_CENTER;
  }, [existingAddress]);

  const [center, setCenter] = useState(initialCenter);
  const [preview, setPreview] = useState({
    address: existingAddress.area || existingAddress.address || existingAddress.label || "Pinned location",
    label: existingAddress.label || "Pinned Location",
    latitude: initialCenter[0],
    longitude: initialCenter[1],
    locality: existingAddress.area || "",
    city: existingAddress.city || "",
    state: existingAddress.state || "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Move the map to place the pin exactly where you want delivery.");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recentMapPicks, setRecentMapPicks] = useState(() => getRecentMapPicks());
  const requestIdRef = useRef(0);

  useEffect(() => {
    setRecentMapPicks(getRecentMapPicks());
  }, []);

  useEffect(() => {
    const nextRequest = window.setTimeout(async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      const results = await geocodeSearch(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 400);

    return () => window.clearTimeout(nextRequest);
  }, [searchQuery]);

  useEffect(() => {
    const currentRequest = ++requestIdRef.current;
    const nextTimeout = window.setTimeout(async () => {
      setGeocodeLoading(true);
      try {
        const details = await reverseGeocode(center[0], center[1]);
        if (requestIdRef.current !== currentRequest) return;
        setPreview({
          address: details.address || details.display_name || "Pinned location",
          label: details.label || "Pinned Location",
          latitude: details.latitude,
          longitude: details.longitude,
          locality: details.locality || "",
          city: details.city || "",
          state: details.state || "",
        });
        setStatusMessage("Finding address...");
        if (details.display_name || details.address) {
          setStatusMessage("Location found successfully");
        }
      } catch {
        if (requestIdRef.current !== currentRequest) return;
        setStatusMessage("Coordinates selected. You can still confirm this location.");
      } finally {
        if (requestIdRef.current === currentRequest) {
          setGeocodeLoading(false);
        }
      }
    }, 450);

    return () => window.clearTimeout(nextTimeout);
  }, [center]);

  const handleMove = (nextCenter) => {
    setCenter(nextCenter);
    setErrorMessage("");
    setStatusMessage("Finding address...");
  };

  const handleUseGps = async () => {
    setGpsLoading(true);
    setErrorMessage("");
    setStatusMessage("Fetching your location...");
    try {
      const current = await getCurrentPositionAsync();
      setCenter([current.latitude, current.longitude]);
      const details = await reverseGeocode(current.latitude, current.longitude);
      setPreview({
        address: details.address || "Current location selected",
        label: details.label || "Current Location",
        latitude: current.latitude,
        longitude: current.longitude,
        locality: details.locality || "",
        city: details.city || "",
        state: details.state || "",
      });
      setStatusMessage("Current GPS location selected");
    } catch (error) {
      const message =
        error?.code === 1
          ? "Location allow karein ya map par pin move karke address choose karein."
          : error?.message === "geolocation_unavailable"
            ? "This device does not support GPS location."
            : "We could not fetch your location right now. Try again or pick manually.";
      setErrorMessage(message);
      setStatusMessage("");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleConfirm = () => {
    const saved = savePickedAddress({
      id: `map_${Date.now()}`,
      type: "Pinned Location",
      label: "Pinned Location",
      address: preview.address || "Pinned location",
      landmark: "",
      lat: preview.latitude,
      lon: preview.longitude,
      selected: true,
      source: "map-picker",
      fullName: checkoutState?.selectedAddress?.fullName || "",
      phone: checkoutState?.selectedAddress?.phone || "",
      city: preview.city || "",
      state: preview.state || "",
      area: preview.locality || preview.city || preview.address || "Pinned location",
    });

    navigate(returnTo, {
      state: {
        ...checkoutState,
        selectedAddress: normalizeAddress(saved),
      },
    });
  };

  const handleSelectSearchResult = (result) => {
    if (!Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) return;
    setCenter([result.latitude, result.longitude]);
    setPreview({
      address: result.address || result.displayName || result.label || "Pinned location",
      label: result.label || "Pinned Location",
      latitude: result.latitude,
      longitude: result.longitude,
      locality: result.locality || "",
      city: result.city || "",
      state: result.state || "",
    });
    setSearchQuery(result.label || result.displayName || "");
    setSearchResults([]);
    setStatusMessage("Search result selected. Move the map to fine-tune the pin.");
  };

  const handleRecentPick = (entry) => {
    if (!Number.isFinite(Number(entry.latitude)) || !Number.isFinite(Number(entry.longitude))) return;
    setCenter([Number(entry.latitude), Number(entry.longitude)]);
    setPreview({
      address: entry.address || entry.label || "Pinned location",
      label: entry.label || "Pinned Location",
      latitude: Number(entry.latitude),
      longitude: Number(entry.longitude),
      locality: "",
      city: "",
      state: "",
    });
    setStatusMessage("Recent pick restored.");
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(to_bottom,_#0f172a,_#0f172a_60%,_#020617)]">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

        <header className="relative z-10 px-4 pt-4">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-[24px] bg-white/95 p-3 shadow-lg shadow-slate-950/10 backdrop-blur">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Map picker</p>
              <h1 className="text-lg font-black text-slate-950">Pick delivery location</h1>
              <p className="text-xs font-semibold leading-5 text-slate-500">
                Move the map to place the pin exactly where you want delivery
              </p>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 px-4 pb-36 pt-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <section className="rounded-[28px] bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
              <div className="flex items-center gap-2 rounded-[20px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search village or address"
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
                {searching ? <Sparkles className="h-4 w-4 animate-pulse text-emerald-600" /> : null}
              </div>
              {searchResults.length ? (
                <div className="mt-3 max-h-40 overflow-auto rounded-[22px] bg-slate-50 p-2 ring-1 ring-slate-100">
          {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      className="flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition hover:bg-white"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <LocateFixed className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-slate-950">{result.label}</span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{result.displayName}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-[0_16px_32px_rgba(16,185,129,0.24)] disabled:bg-emerald-300"
                >
                  <LocateFixed className="h-4 w-4" />
                  {gpsLoading ? "Fetching your location..." : "Use Current GPS"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(returnTo)}
                  className="rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </section>

            {errorMessage ? (
              <div className="rounded-[22px] bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800 ring-1 ring-orange-100">
                {errorMessage}
              </div>
            ) : null}
            <div className="rounded-[22px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 ring-1 ring-slate-100">
              {statusMessage}
            </div>

            <section className="relative overflow-hidden rounded-[34px] bg-white p-3 shadow-[0_22px_60px_rgba(15,23,42,0.24)] ring-1 ring-slate-100">
              <div className="relative h-[58vh] min-h-[420px] overflow-hidden rounded-[28px] bg-slate-100">
                <MapContainer
                  center={center}
                  zoom={16}
                  scrollWheelZoom
                  className="h-full w-full"
                  zoomControl={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapSync center={center} />
                  <MapListener onMove={handleMove} />
                </MapContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative -mt-10 flex h-20 w-20 items-center justify-center">
                    <span className="absolute h-16 w-16 rounded-full bg-emerald-500/20 blur-xl" />
                    <span className="absolute bottom-2 h-4 w-4 rounded-full bg-emerald-600 shadow-[0_0_0_10px_rgba(16,185,129,0.14)]" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
                      <MapPin className="h-5 w-5 text-emerald-700" />
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseGps}
                  disabled={gpsLoading}
                  className="absolute right-3 top-3 rounded-full bg-white/95 px-4 py-3 text-xs font-black text-slate-700 shadow-lg ring-1 ring-slate-100 backdrop-blur disabled:opacity-70"
                >
                  {gpsLoading ? "Finding..." : "Use Current GPS"}
                </button>
              </div>
            </section>

            {recentMapPicks.length ? (
              <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Recent map picks</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recentMapPicks.slice(0, 3).map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => handleRecentPick(entry)}
                      className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 ring-1 ring-slate-100"
                    >
                      {entry.label}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </main>

        <footer className="fixed bottom-16 left-0 right-0 z-20 px-4 pb-4">
          <div className="mx-auto max-w-3xl rounded-[30px] bg-white/95 p-4 shadow-[0_-18px_50px_rgba(15,23,42,0.22)] ring-1 ring-slate-100 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Selected location</p>
                  <p className="mt-1 text-base font-black text-slate-950">{preview.label || "Pinned location"}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{preview.address || "Finding address..."}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    {Number.isFinite(Number(preview.latitude)) && Number.isFinite(Number(preview.longitude))
                      ? `${Number(preview.latitude).toFixed(5)}, ${Number(preview.longitude).toFixed(5)}`
                      : "Coordinates pending"}
                  </p>
                </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                {geocodeLoading ? "Finding address..." : "Ready"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-[0_16px_32px_rgba(16,185,129,0.24)]"
              >
                Confirm Location
              </button>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={gpsLoading}
                className="rounded-full border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-800"
              >
                Use Current GPS
              </button>
              <button
                type="button"
                onClick={() => navigate(returnTo)}
                className="rounded-full bg-slate-50 px-4 py-4 text-sm font-black text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MapPicker;
