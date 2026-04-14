const hasStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export const RECENT_ADDRESS_SEARCHES_KEY = "apnagaon_recent_address_searches_v1";

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeRecentSearch = (entry = {}) => ({
  id: entry.id || `recent_${Date.now()}`,
  label: String(entry.label || entry.query || "Recent search").trim(),
  query: String(entry.query || entry.label || "").trim(),
  addressId: String(entry.addressId || "").trim(),
  createdAt: entry.createdAt || new Date().toISOString(),
});

export const getRecentAddressSearches = () => {
  if (!hasStorage()) return [];
  const saved = safeParse(window.localStorage.getItem(RECENT_ADDRESS_SEARCHES_KEY), []);
  return Array.isArray(saved) ? saved.map(normalizeRecentSearch) : [];
};

export const saveRecentAddressSearch = (entry = {}) => {
  const nextEntry = normalizeRecentSearch(entry);
  if (!hasStorage()) return nextEntry;

  try {
    const existing = getRecentAddressSearches();
    const next = [
      nextEntry,
      ...existing.filter((item) => item.query !== nextEntry.query || item.addressId !== nextEntry.addressId),
    ].slice(0, 8);
    window.localStorage.setItem(RECENT_ADDRESS_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage errors in the demo flow.
  }

  return nextEntry;
};

export default {
  RECENT_ADDRESS_SEARCHES_KEY,
  getRecentAddressSearches,
  saveRecentAddressSearch,
};
