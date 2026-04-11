const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const values = [lat1, lon1, lat2, lon2].map(Number);
  if (!values.every(Number.isFinite)) return Infinity;
  const [aLat, aLon, bLat, bLon] = values;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const estimateDeliveryTime = (distanceKm, baseMinutes = 0) => {
  const base = Number(baseMinutes) || 0;
  if (!Number.isFinite(distanceKm)) return base + 45;
  if (distanceKm < 2) return base + 10;
  if (distanceKm < 5) return base + 20;
  if (distanceKm < 8) return base + 30;
  return base + 45;
};

const withNearbyMeta = (items, lat, lon, radius = 10) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const distanceKm = getDistanceKm(lat, lon, item.lat, item.lon);
      const plain = typeof item.toObject === "function" ? item.toObject() : item;
      return {
        ...plain,
        distanceKm,
        etaMinutes: estimateDeliveryTime(distanceKm, item.etaBaseMinutes),
      };
    })
    .filter((item) => Number.isFinite(item.distanceKm) && item.distanceKm <= Number(radius || 10))
    .sort((a, b) => a.distanceKm - b.distanceKm);

module.exports = {
  estimateDeliveryTime,
  getDistanceKm,
  withNearbyMeta,
};
