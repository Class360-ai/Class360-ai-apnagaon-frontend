import { getSelectedAddress as getSavedSelectedAddress, normalizeAddress, saveSelectedAddress } from "./locationHelpers";

const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const MAP_RECENT_PICK_KEY = "apnagaon_recent_map_picks_v1";

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const formatReadableAddress = (data = {}) =>
  [data.address, data.locality, data.village, data.city, data.state]
    .filter(Boolean)
    .join(", ") || data.display_name || data.label || "Pinned location";

export const getCurrentPositionAsync = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("geolocation_unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60 * 1000,
      }
    );
  });

export const reverseGeocode = async (lat, lng) => {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
    return {
      address: "Pinned location",
      locality: "",
      village: "",
      city: "",
      state: "",
      latitude: safeLat,
      longitude: safeLng,
      label: "Pinned location",
    };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(safeLat)}&lon=${encodeURIComponent(safeLng)}&zoom=18&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("reverse_geocode_failed");
    const data = await response.json();
    const address = data.address || {};

    return {
      address: formatReadableAddress({
        address: address.road || address.neighbourhood || address.suburb || data.display_name,
        locality: address.neighbourhood || address.suburb || address.village || address.hamlet || "",
        village: address.village || address.town || address.city_district || "",
        city: address.city || address.town || address.county || "",
        state: address.state || "",
        label: address.village || address.town || address.city || address.suburb || "Pinned location",
        display_name: data.display_name || "",
      }),
      locality: address.neighbourhood || address.suburb || address.village || address.hamlet || "",
      village: address.village || address.town || address.city_district || "",
      city: address.city || address.town || address.county || "",
      state: address.state || "",
      postcode: address.postcode || "",
      latitude: safeLat,
      longitude: safeLng,
      label: address.village || address.town || address.city || address.suburb || "Pinned location",
      display_name: data.display_name || "",
    };
  } catch {
    return {
      address: `Pinned location (${safeLat.toFixed(5)}, ${safeLng.toFixed(5)})`,
      locality: "",
      village: "",
      city: "",
      state: "",
      postcode: "",
      latitude: safeLat,
      longitude: safeLng,
      label: "Pinned location",
      display_name: "",
    };
  }
};

export const geocodeSearch = async (query) => {
  const term = String(query || "").trim();
  if (!term) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(term)}&addressdetails=1&limit=5`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("geocode_search_failed");
    const results = await response.json();
    return Array.isArray(results)
      ? results.map((item) => ({
          id: item.place_id,
          label: item.name || item.display_name || term,
          displayName: item.display_name || item.name || term,
          latitude: Number(item.lat),
          longitude: Number(item.lon),
          address: formatReadableAddress({
            address: item.address?.road || item.address?.neighbourhood || item.display_name,
            locality: item.address?.neighbourhood || item.address?.suburb || item.address?.village || "",
            village: item.address?.village || item.address?.town || item.address?.city_district || "",
            city: item.address?.city || item.address?.town || item.address?.county || "",
            state: item.address?.state || "",
            label: item.address?.village || item.address?.town || item.address?.city || item.address?.suburb || item.name || term,
          }),
          locality: item.address?.neighbourhood || item.address?.suburb || item.address?.village || "",
          city: item.address?.city || item.address?.town || item.address?.county || "",
          state: item.address?.state || "",
          postcode: item.address?.postcode || "",
        }))
      : [];
  } catch {
    return [];
  }
};

export const getRecentMapPicks = () => {
  if (!hasStorage()) return [];
  try {
    const saved = safeParse(window.localStorage.getItem(MAP_RECENT_PICK_KEY), []);
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const saveRecentMapPick = (address = {}) => {
  const entry = {
    id: address.id || `map_${Date.now()}`,
    label: String(address.label || "Pinned location").trim(),
    address: String(address.address || "").trim(),
    latitude: Number(address.lat ?? address.latitude ?? 0) || 0,
    longitude: Number(address.lng ?? address.lon ?? address.longitude ?? 0) || 0,
    createdAt: new Date().toISOString(),
  };

  if (!hasStorage()) return entry;

  try {
    const existing = getRecentMapPicks();
    const next = [entry, ...existing.filter((item) => item.address !== entry.address || item.latitude !== entry.latitude || item.longitude !== entry.longitude)].slice(0, 5);
    window.localStorage.setItem(MAP_RECENT_PICK_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage write failures in demo mode.
  }

  return entry;
};

export const savePickedAddress = (address = {}) => {
  const normalized = normalizeAddress({
    ...address,
    label: address.type || address.label || "Pinned Location",
    source: "map-picker",
    selected: true,
    lat: address.lat ?? address.latitude ?? null,
    lon: address.lng ?? address.longitude ?? null,
  });
  const saved = saveSelectedAddress(normalized);
  saveRecentMapPick(saved);
  return saved;
};

export const getSelectedAddress = () => getSavedSelectedAddress();

export default {
  getCurrentPositionAsync,
  reverseGeocode,
  geocodeSearch,
  savePickedAddress,
  getSelectedAddress,
  getRecentMapPicks,
  saveRecentMapPick,
};
