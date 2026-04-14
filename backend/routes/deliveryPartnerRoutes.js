const express = require("express");
const DeliveryPartner = require("../models/DeliveryPartner");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { seedDeliveryPartnersInDatabase } = require("../utils/deliveryPartnerSeeder");

const router = express.Router();

const normalizeStatus = (status) => {
  const value = String(status || "").trim().toLowerCase();
  if (value === "offline") return "offline";
  if (value === "busy") return "busy";
  return "available";
};

router.get("/test", (req, res) =>
  res.json({ ok: true, route: "delivery partners working" })
);

const buildFilter = (req) => {
  const includeUnavailable = ["true", "1", "yes"].includes(String(req.query.includeUnavailable || req.query.all || "").toLowerCase());
  if (includeUnavailable) return {};
  return {
    $or: [
      { currentStatus: "available" },
      { status: "available" },
      { isAvailable: true },
      { available: true },
    ],
  };
};

router.post("/seed", requireAuth, roleCheck("owner"), async (req, res, next) => {
  try {
    const seeded = await seedDeliveryPartnersInDatabase();
    return res.status(201).json({
      ok: true,
      count: seeded.length,
      deliveryPartners: seeded,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/", requireAuth, roleCheck("owner"), async (req, res, next) => {
  try {
    console.log("[ApnaGaon] GET /api/delivery-partners route hit", {
      method: req.method,
      path: req.originalUrl,
    });
    const partners = await DeliveryPartner.find(buildFilter(req)).sort({ createdAt: -1 }).limit(200);
    return res.json(partners);
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, roleCheck("owner"), async (req, res, next) => {
  try {
    const payload = {
      name: String(req.body.name || "").trim(),
      phone: String(req.body.phone || "").trim(),
      vehicle: String(req.body.vehicle || "Bike").trim(),
      vehicleType: String(req.body.vehicleType || req.body.vehicle || "Bike").trim(),
      currentOrderId: req.body.currentOrderId ? String(req.body.currentOrderId).trim() : null,
      area: String(req.body.area || "").trim(),
      notes: String(req.body.notes || "").trim(),
      status: normalizeStatus(req.body.status),
      currentStatus: normalizeStatus(req.body.currentStatus || req.body.status),
      available: normalizeStatus(req.body.status) === "available",
      isAvailable: normalizeStatus(req.body.status) === "available",
    };
    if (!payload.name || !payload.phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }
    const partner = await DeliveryPartner.create(payload);
    return res.status(201).json(partner);
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/status", requireAuth, roleCheck("owner"), async (req, res, next) => {
  try {
    const status = normalizeStatus(req.body.status);
    const partner = await DeliveryPartner.findByIdAndUpdate(
      req.params.id,
      { status, currentStatus: status, available: status === "available", isAvailable: status === "available" },
      { new: true }
    );
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    return res.json(partner);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAuth, roleCheck("owner"), async (req, res, next) => {
  try {
    const status = req.body.status ? normalizeStatus(req.body.status) : undefined;
    const payload = {
      ...(req.body.name ? { name: String(req.body.name).trim() } : {}),
      ...(req.body.phone ? { phone: String(req.body.phone).trim() } : {}),
      ...(req.body.vehicle ? { vehicle: String(req.body.vehicle).trim() } : {}),
      ...(req.body.vehicleType ? { vehicleType: String(req.body.vehicleType).trim() } : {}),
      ...(req.body.area ? { area: String(req.body.area).trim() } : {}),
      ...(req.body.notes ? { notes: String(req.body.notes).trim() } : {}),
      ...(status ? { status, currentStatus: status, available: status === "available", isAvailable: status === "available" } : {}),
    };
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    return res.json(partner);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
