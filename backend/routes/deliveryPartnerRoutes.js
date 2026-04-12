const express = require("express");
const DeliveryPartner = require("../models/DeliveryPartner");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { seedDeliveryPartnersInDatabase } = require("../utils/deliveryPartnerSeeder");

const router = express.Router();

const normalizeStatus = (status) => (String(status || "").trim().toLowerCase() === "busy" ? "busy" : "available");

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
    const partners = await DeliveryPartner.find({}).sort({ createdAt: -1 }).limit(200);
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
      currentOrderId: req.body.currentOrderId ? String(req.body.currentOrderId).trim() : null,
      area: String(req.body.area || "").trim(),
      notes: String(req.body.notes || "").trim(),
      status: normalizeStatus(req.body.status),
      available: normalizeStatus(req.body.status) === "available",
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
      { status, available: status === "available" },
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
      ...(req.body.area ? { area: String(req.body.area).trim() } : {}),
      ...(req.body.notes ? { notes: String(req.body.notes).trim() } : {}),
      ...(status ? { status, available: status === "available" } : {}),
    };
    const partner = await DeliveryPartner.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!partner) return res.status(404).json({ message: "Delivery partner not found" });
    return res.json(partner);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
