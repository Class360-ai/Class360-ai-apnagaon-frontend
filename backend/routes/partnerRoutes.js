const express = require("express");
const Partner = require("../models/Partner");
const { notifyRoleUsers } = require("../utils/notificationHelpers");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

const requiredFields = ["shopName", "ownerName", "phone", "whatsapp", "category", "address", "area", "city", "state", "pincode"];

const validatePartner = (body = {}) => requiredFields.filter((field) => !String(body[field] || "").trim());

router.post("/apply", async (req, res) => {
  const missing = validatePartner(req.body);
  if (missing.length) return res.status(400).json({ message: "Missing required fields", missing });
  const partner = await Partner.create({ ...req.body, status: "pending" });
  await notifyRoleUsers("admin", {
    role: "admin",
    title: "New shop application",
    message: `${partner.shopName || "A local shop"} has applied to join ApnaGaon.`,
    type: "system",
    read: false,
    link: "/admin/shops/applications",
  });
  return res.status(201).json(partner);
});

router.get("/approved", async (req, res) => {
  const partners = await Partner.find({ status: "approved" }).sort({ updatedAt: -1 }).limit(100);
  return res.json(partners);
});

router.get("/status", async (req, res) => {
  const phone = String(req.query.phone || "").trim();
  if (!phone) return res.status(400).json({ message: "Phone number is required" });
  const partner = await Partner.findOne({
    $or: [{ phone }, { whatsapp: phone }],
  }).sort({ updatedAt: -1, createdAt: -1 });
  if (!partner) return res.status(404).json({ message: "Application not found" });
  return res.json(partner);
});

router.get("/admin/partners", requireAuth, roleCheck("admin"), async (req, res) => {
  const partners = await Partner.find({}).sort({ createdAt: -1 }).limit(200);
  return res.json(partners);
});

router.put("/admin/partners/:id/status", requireAuth, roleCheck("admin"), async (req, res) => {
  const partner = await Partner.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!partner) return res.status(404).json({ message: "Partner not found" });
  return res.json(partner);
});

module.exports = router;
