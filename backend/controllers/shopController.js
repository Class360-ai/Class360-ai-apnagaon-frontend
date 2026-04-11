const Shop = require("../models/Shop");
const { withNearbyMeta } = require("../utils/location");

const getShops = async (req, res) => {
  const shops = await Shop.find({ active: { $ne: false } }).sort({ createdAt: -1 });
  res.json(shops);
};

const createShop = async (req, res) => {
  const payload = {
    ...req.body,
    lat: Number.isFinite(Number(req.body.lat)) ? Number(req.body.lat) : null,
    lon: Number.isFinite(Number(req.body.lon)) ? Number(req.body.lon) : null,
    active: req.body.active !== false,
    available: req.body.available !== false,
  };
  const shop = await Shop.create(payload);
  res.status(201).json(shop);
};

const updateShop = async (req, res) => {
  const payload = {
    ...req.body,
    ...(Object.prototype.hasOwnProperty.call(req.body, "lat")
      ? { lat: Number.isFinite(Number(req.body.lat)) ? Number(req.body.lat) : null }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(req.body, "lon")
      ? { lon: Number.isFinite(Number(req.body.lon)) ? Number(req.body.lon) : null }
      : {}),
  };
  if (Object.prototype.hasOwnProperty.call(payload, "active")) {
    payload.active = Boolean(payload.active);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "available")) {
    payload.available = Boolean(payload.available);
  }
  const shop = await Shop.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!shop) return res.status(404).json({ message: "Shop not found" });
  res.json(shop);
};

const getNearbyShops = async (req, res) => {
  const { lat, lon, radius = 10 } = req.query;
  const shops = await Shop.find({ available: true, active: { $ne: false } });
  res.json(withNearbyMeta(shops, lat, lon, radius));
};

module.exports = {
  createShop,
  getNearbyShops,
  getShops,
  updateShop,
};
