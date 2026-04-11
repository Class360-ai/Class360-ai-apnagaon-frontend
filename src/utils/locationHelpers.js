import { useCallback, useEffect, useMemo, useState } from "react";

export const SELECTED_ADDRESS_KEY = "apnagaon_selected_address_v1";
export const SELECTED_ADDRESS_ALIAS_KEY = "apnagaon_selected_address";
export const LEGACY_LOCATION_KEY = "apnagaon_location_intelligence_v1";
export const LEGACY_CART_LOCATION_KEY = "apnagaon_cart_location";
export const LOCATION_UPDATED_EVENT = "apnagaon:location-updated";

export const DEFAULT_ADDRESS = {
  id: "addr_default",
  label: "Home",
  fullName: "",
  phone: "",
  house: "",
  area: "Azampur",
  city: "Azamgarh",
  state: "Uttar Pradesh",
  pincode: "276125",
  note: "",
  lat: 26.0664,
  lon: 83.1859,
  source: "default",
};

export const SAVED_ADDRESSES_KEY = "apnagaon_saved_addresses_v1";
export const SAVED_ADDRESSES_ALIAS_KEY = "apnagaon_addresses";

export const mockShops = [
  { id: "shop-sharma-kirana", name: "Sharma Kirana Store", category: "grocery", address: "Azampur Bazaar", area: "Azampur", city: "Azamgarh", state: "Uttar Pradesh", lat: 26.0672, lon: 83.1882, phone: "9876543210", available: true, etaBaseMinutes: 8, tags: ["atta", "rice", "oil"] },
  { id: "shop-gaon-dairy", name: "Gaon Fresh Dairy", category: "dairy", address: "Near Panchayat Bhawan", area: "Azampur", city: "Azamgarh", state: "Uttar Pradesh", lat: 26.0713, lon: 83.196, phone: "9876543211", available: true, etaBaseMinutes: 10, tags: ["milk", "curd"] },
  { id: "shop-azampur-veg", name: "Azampur Fresh Sabzi", category: "vegetables", address: "Sabzi Mandi Road", area: "Azampur", city: "Azamgarh", state: "Uttar Pradesh", lat: 26.0551, lon: 83.1785, phone: "9876543212", available: true, etaBaseMinutes: 12, tags: ["vegetables", "fruits"] },
  { id: "shop-town-medical", name: "Town Medical Point", category: "medical", address: "Main Road", area: "Azamgarh", city: "Azamgarh", state: "Uttar Pradesh", lat: 26.112, lon: 83.231, phone: "9876543213", available: true, etaBaseMinutes: 18, tags: ["medicine"] },
];

export const mockServices = [
  { id: "svc-local-electrician", name: "Raju Electrician", serviceType: "electrician", address: "Azampur", area: "Azampur", city: "Azamgarh", lat: 26.0646, lon: 83.1814, phone: "9876543220", available: true, etaBaseMinutes: 12 },
  { id: "svc-water-tanker", name: "Village Water Tanker", serviceType: "water", address: "Panchayat Road", area: "Azampur", city: "Azamgarh", lat: 26.0775, lon: 83.2018, phone: "9876543221", available: true, etaBaseMinutes: 20 },
  { id: "svc-auto-stand", name: "Azampur Auto Stand", serviceType: "ride", address: "Auto Stand", area: "Azampur", city: "Azamgarh", lat: 26.0525, lon: 83.1716, phone: "9876543222", available: true, etaBaseMinutes: 10 },
  { id: "svc-far-carpenter", name: "City Carpenter Help", serviceType: "carpenter", address: "Azamgarh City", area: "Azamgarh", city: "Azamgarh", lat: 26.142, lon: 83.245, phone: "9876543223", available: true, etaBaseMinutes: 30 },
];

const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const createAddressId = () => `addr_${Date.now()}`;

export const formatAddressLine = (address = {}) =>
  [address.house, address.area, address.city, address.state, address.pincode].filter(Boolean).join(", ") ||
  address.name ||
  DEFAULT_ADDRESS.area;

export const getAddressLocationName = (address = {}) => address.area || address.city || address.name || DEFAULT_ADDRESS.area;

export const normalizeAddress = (address = {}) => {
  const lat = address.lat === null || address.lat === undefined ? null : Number(address.lat);
  const lon = address.lon === null || address.lon === undefined ? null : Number(address.lon);
  const name = address.name || address.locationName || address.area || DEFAULT_ADDRESS.area;
  return {
    ...DEFAULT_ADDRESS,
    ...address,
    id: address.id || createAddressId(),
    label: address.label || "Home",
    area: address.area || name,
    city: address.city || "",
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
    source: address.source || "manual",
  };
};

export const saveSelectedAddress = (address) => {
  const normalized = normalizeAddress(address);
  if (hasStorage()) {
    try {
      window.localStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(normalized));
      window.localStorage.setItem(SELECTED_ADDRESS_ALIAS_KEY, JSON.stringify(normalized));
      const savedAddresses = getSavedAddresses();
      const nextAddresses = [normalized, ...savedAddresses.filter((item) => item.id !== normalized.id)].slice(0, 8);
      window.localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(nextAddresses));
      window.localStorage.setItem(SAVED_ADDRESSES_ALIAS_KEY, JSON.stringify(nextAddresses));
      window.localStorage.setItem(LEGACY_LOCATION_KEY, JSON.stringify({ name: getAddressLocationName(normalized), lat: normalized.lat, lon: normalized.lon }));
      window.localStorage.setItem(LEGACY_CART_LOCATION_KEY, JSON.stringify({ locationName: getAddressLocationName(normalized), lat: normalized.lat, lon: normalized.lon }));
      window.dispatchEvent(new CustomEvent(LOCATION_UPDATED_EVENT, { detail: normalized }));
    } catch {
      // UI can still use the in-memory address.
    }
  }
  return normalized;
};

export const getSavedAddresses = () => {
  if (!hasStorage()) return [];
  try {
    const saved = window.localStorage.getItem(SAVED_ADDRESSES_KEY) || window.localStorage.getItem(SAVED_ADDRESSES_ALIAS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeAddress) : [];
  } catch {
    return [];
  }
};

export const getSelectedAddress = () => {
  if (!hasStorage()) return null;
  try {
    const saved = window.localStorage.getItem(SELECTED_ADDRESS_KEY) || window.localStorage.getItem(SELECTED_ADDRESS_ALIAS_KEY);
    if (saved) return normalizeAddress(JSON.parse(saved));
  } catch {
    // Try legacy keys.
  }
  try {
    const legacy = window.localStorage.getItem(LEGACY_LOCATION_KEY) || window.localStorage.getItem(LEGACY_CART_LOCATION_KEY);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy);
    if (!Number.isFinite(Number(parsed.lat)) || !Number.isFinite(Number(parsed.lon))) return null;
    return normalizeAddress({
      area: parsed.name || parsed.locationName || DEFAULT_ADDRESS.area,
      lat: Number(parsed.lat),
      lon: Number(parsed.lon),
      source: "current",
    });
  } catch {
    return null;
  }
};

export const getBestAddressName = (data = {}) => {
  const address = data.address || {};
  return address.village || address.town || address.city || address.suburb || address.neighbourhood || address.hamlet || data.name || DEFAULT_ADDRESS.area;
};

export const reverseGeocode = async (lat, lon) => {
  const safeLat = Number(lat);
  const safeLon = Number(lon);
  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLon)) return normalizeAddress(DEFAULT_ADDRESS);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(safeLat)}&lon=${encodeURIComponent(safeLon)}&zoom=18&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("reverse_geocode_failed");
    const data = await response.json();
    const address = data.address || {};
    return normalizeAddress({
      area: getBestAddressName(data),
      city: address.city || address.town || address.state_district || "",
      state: address.state || "",
      pincode: address.postcode || "",
      lat: safeLat,
      lon: safeLon,
      source: "current",
    });
  } catch {
    return normalizeAddress({ area: "Current Location", lat: safeLat, lon: safeLon, source: "current" });
  }
};

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("geolocation_unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        resolve(await reverseGeocode(lat, lon));
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  });

export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const values = [lat1, lon1, lat2, lon2].map(Number);
  if (!values.every(Number.isFinite)) return Infinity;
  const [aLat, aLon, bLat, bLon] = values;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const estimateDeliveryTime = (distanceKm) => {
  if (!Number.isFinite(distanceKm)) return "45 min";
  if (distanceKm < 2) return "10 min";
  if (distanceKm < 5) return "20 min";
  if (distanceKm < 8) return "30 min";
  return "45 min";
};

export const getNearbyEntries = (address, entries = [], radiusKm = 10) => {
  const hasLatLon = Number.isFinite(Number(address?.lat)) && Number.isFinite(Number(address?.lon));
  if (!hasLatLon) {
    const area = String(address?.area || "").toLowerCase();
    const city = String(address?.city || "").toLowerCase();
    return (Array.isArray(entries) ? entries : [])
      .filter((entry) => {
        const entryArea = String(entry.area || "").toLowerCase();
        const entryCity = String(entry.city || "").toLowerCase();
        return !area || entryArea.includes(area) || entryCity.includes(city);
      })
      .map((entry) => ({ ...entry, distanceKm: null, eta: "Approx. 45 min", approximate: true }));
  }
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const distanceKm = getDistanceKm(address.lat, address.lon, entry.lat, entry.lon);
      return { ...entry, distanceKm, eta: estimateDeliveryTime(distanceKm), approximate: false };
    })
    .filter((entry) => Number.isFinite(entry.distanceKm) && entry.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

export const openDirections = (destination, origin) => {
  const destLat = Number(destination?.lat);
  const destLon = Number(destination?.lon);
  if (!Number.isFinite(destLat) || !Number.isFinite(destLon)) return false;
  const originLat = Number(origin?.lat);
  const originLon = Number(origin?.lon);
  const originParam = Number.isFinite(originLat) && Number.isFinite(originLon) ? `&origin=${originLat},${originLon}` : "";
  const url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destLat},${destLon}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
};

export const useLocationIntelligence = () => {
  const [initialState] = useState(() => {
    const saved = getSelectedAddress();
    return { address: saved || normalizeAddress(DEFAULT_ADDRESS), hasSaved: Boolean(saved) };
  });
  const [address, setAddress] = useState(initialState.address);
  const [status, setStatus] = useState(initialState.hasSaved ? "ready" : "detecting");
  const [message, setMessage] = useState(initialState.hasSaved ? "" : "Detecting your location...");

  const applyAddress = useCallback((nextAddress) => {
    const saved = saveSelectedAddress(nextAddress);
    setAddress(saved);
    setStatus("ready");
    setMessage("");
    return saved;
  }, []);

  const requestCurrentLocation = useCallback(async () => {
    setStatus("detecting");
    setMessage("Detecting your location...");
    try {
      return applyAddress(await getCurrentLocation());
    } catch {
      setStatus("denied");
      setMessage("Enable location for better service");
      return address;
    }
  }, [address, applyAddress]);

  const confirmPickedLocation = useCallback(
    async (point) => {
      setStatus("detecting");
      setMessage("Fetching location...");
      try {
        return applyAddress({ ...(await reverseGeocode(point.lat, point.lon)), source: "map" });
      } catch {
        return applyAddress({ area: "Selected Location", lat: point.lat, lon: point.lon, source: "map" });
      }
    },
    [applyAddress]
  );

  useEffect(() => {
    if (!initialState.hasSaved) {
      getCurrentLocation()
        .then(applyAddress)
        .catch(() => {
          setAddress(normalizeAddress(DEFAULT_ADDRESS));
          setStatus("denied");
          setMessage("Enable location for better service");
        });
    }

    const syncAddress = (event) => {
      const next = event.detail ? normalizeAddress(event.detail) : getSelectedAddress();
      if (next) {
        setAddress(next);
        setStatus("ready");
        setMessage("");
      }
    };
    window.addEventListener(LOCATION_UPDATED_EVENT, syncAddress);
    window.addEventListener("storage", syncAddress);
    return () => {
      window.removeEventListener(LOCATION_UPDATED_EVENT, syncAddress);
      window.removeEventListener("storage", syncAddress);
    };
  }, [applyAddress, initialState.hasSaved]);

  const nearbyShops = useMemo(() => getNearbyEntries(address, mockShops, 10), [address]);
  const nearbyServices = useMemo(() => getNearbyEntries(address, mockServices, 10), [address]);
  const nearestDistance = nearbyShops[0]?.distanceKm ?? nearbyServices[0]?.distanceKm ?? Infinity;
  const deliveryEstimate = estimateDeliveryTime(nearestDistance);

  return {
    address,
    location: { name: getAddressLocationName(address), lat: address.lat, lon: address.lon },
    status,
    message,
    loading: status === "detecting",
    nearbyShops,
    nearbyServices,
    deliveryEstimate,
    requestCurrentLocation,
    confirmPickedLocation,
    saveAddress: applyAddress,
  };
};

export const getDeliveryEstimate = estimateDeliveryTime;
export const getDistance = getDistanceKm;
export const DEFAULT_LOCATION = { name: DEFAULT_ADDRESS.area, lat: DEFAULT_ADDRESS.lat, lon: DEFAULT_ADDRESS.lon };
