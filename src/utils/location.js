import { getCurrentLocation as getBrowserCurrentLocation, normalizeAddress } from "./locationHelpers";

export const createLocationSnapshot = ({
  latitude = null,
  longitude = null,
  addressLabel = "",
  locationSource = "manual",
} = {}) => ({
  latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : null,
  longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : null,
  addressLabel: String(addressLabel || "").trim(),
  locationSource: locationSource === "gps" ? "gps" : "manual",
});

export const formatLocationLabel = (location = {}) => {
  const addressLabel = String(location.addressLabel || location.area || location.city || location.label || "Current location selected").trim();
  const latitude = Number(location.latitude ?? location.lat);
  const longitude = Number(location.longitude ?? location.lon);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `${addressLabel} (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
  }
  return addressLabel;
};

export const getCurrentLocation = async () => {
  const normalized = normalizeAddress(await getBrowserCurrentLocation());
  return createLocationSnapshot({
    latitude: normalized.lat,
    longitude: normalized.lon,
    addressLabel: normalized.area || normalized.city || normalized.label || "Current location selected",
    locationSource: "gps",
  });
};

export default {
  createLocationSnapshot,
  formatLocationLabel,
  getCurrentLocation,
};
