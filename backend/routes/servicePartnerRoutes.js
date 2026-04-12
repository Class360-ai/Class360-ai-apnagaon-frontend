const express = require("express");
const ServicePartner = require("../models/ServicePartner");
const { notifyRoleUsers } = require("../utils/notificationHelpers");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

const requiredFields = ["name", "phone", "serviceType", "area", "address", "availableTimings"];

const validateServicePartner = (body = {}) => requiredFields.filter((field) => !String(body[field] || "").trim());

router.post("/apply", async (req, res) => {
  const missing = validateServicePartner(req.body);
  if (missing.length) return res.status(400).json({ message: "Missing required fields", missing });
  const partner = await ServicePartner.create({ ...req.body, status: "pending" });
  await notifyRoleUsers("owner", {
    role: "owner",
    title: "New service application",
    message: `${partner.name || "A service provider"} has applied to join ApnaGaon.`,
    type: "system",
    read: false,
    link: "/admin/partners",
  });
  return res.status(201).json(partner);
});

router.get("/approved", async (req, res) => {
  const partners = await ServicePartner.find({ status: "approved" }).sort({ updatedAt: -1 }).limit(100);
  return res.json(partners);
});

router.get("/admin/service-partners", requireAuth, roleCheck("owner"), async (req, res) => {
  const partners = await ServicePartner.find({}).sort({ createdAt: -1 }).limit(200);
  return res.json(partners);
});

router.put("/admin/service-partners/:id/status", requireAuth, roleCheck("owner"), async (req, res) => {
  const partner = await ServicePartner.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!partner) return res.status(404).json({ message: "Service partner not found" });
  return res.json(partner);
});

module.exports = router;
