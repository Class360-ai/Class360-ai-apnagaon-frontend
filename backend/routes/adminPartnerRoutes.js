const express = require("express");
const Partner = require("../models/Partner");
const ServicePartner = require("../models/ServicePartner");
const Shop = require("../models/Shop");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();
const allowedStatuses = new Set(["pending", "approved", "rejected", "suspended"]);

router.use(requireAuth, roleCheck("admin"));

router.get("/partners", async (req, res) => {
  const partners = await Partner.find({}).sort({ createdAt: -1 }).limit(200);
  return res.json(partners);
});

router.put("/partners/:id/status", async (req, res) => {
  if (!allowedStatuses.has(req.body.status)) return res.status(400).json({ message: "Invalid status" });
  const partner = await Partner.findById(req.params.id);
  if (!partner) return res.status(404).json({ message: "Partner not found" });
  partner.status = req.body.status;
  partner.reviewNote = String(req.body.reviewNote || req.body.note || "").trim();

  if (req.body.status === "approved") {
    const shopPayload = {
      name: partner.shopName,
      category: partner.category || "grocery",
      address: partner.address || "",
      area: partner.area || "",
      city: partner.city || "",
      state: partner.state || "",
      lat: Number.isFinite(Number(partner.lat)) ? Number(partner.lat) : null,
      lon: Number.isFinite(Number(partner.lon)) ? Number(partner.lon) : null,
      phone: partner.phone || "",
      whatsapp: partner.whatsapp || partner.phone || "",
      ownerName: partner.ownerName || "",
      logo: partner.image || "",
      description: partner.description || "",
      openingTime: partner.openingTime || "",
      closingTime: partner.closingTime || "",
      deliveryAvailable: partner.deliveryAvailable !== false,
      available: true,
      active: true,
      partnerId: partner._id,
      approvedAt: new Date(),
      tags: [partner.category, partner.area].filter(Boolean),
    };

    const existingShop = partner.shopId ? await Shop.findById(partner.shopId) : null;
    const shop = existingShop
      ? await Shop.findByIdAndUpdate(existingShop._id, shopPayload, { new: true })
      : await Shop.create(shopPayload);
    partner.shopId = shop._id;
    partner.approvedAt = new Date();
  }

  if (req.body.status !== "approved") {
    if (partner.shopId) {
      await Shop.findByIdAndUpdate(partner.shopId, { active: false, available: false }, { new: true });
    }
  }

  await partner.save();
  return res.json(partner);
});

router.get("/service-partners", async (req, res) => {
  const partners = await ServicePartner.find({}).sort({ createdAt: -1 }).limit(200);
  return res.json(partners);
});

router.put("/service-partners/:id/status", async (req, res) => {
  if (!allowedStatuses.has(req.body.status)) return res.status(400).json({ message: "Invalid status" });
  const partner = await ServicePartner.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!partner) return res.status(404).json({ message: "Service partner not found" });
  return res.json(partner);
});

module.exports = router;
