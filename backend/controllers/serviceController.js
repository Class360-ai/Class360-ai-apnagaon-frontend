const ServiceProvider = require("../models/ServiceProvider");
const { withNearbyMeta } = require("../utils/location");

const getServices = async (req, res) => {
  const services = await ServiceProvider.find({}).sort({ createdAt: -1 });
  res.json(services);
};

const createService = async (req, res) => {
  const service = await ServiceProvider.create(req.body);
  res.status(201).json(service);
};

const getNearbyServices = async (req, res) => {
  const { lat, lon, radius = 10 } = req.query;
  const services = await ServiceProvider.find({ available: true });
  res.json(withNearbyMeta(services, lat, lon, radius));
};

module.exports = {
  createService,
  getNearbyServices,
  getServices,
};
