const express = require("express");
const Address = require("../models/Address");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const addresses = await Address.find({ userId: req.user._id }).sort({ updatedAt: -1 });
  return res.json(addresses);
});

router.post("/", async (req, res) => {
  const address = await Address.create({ ...req.body, userId: req.user._id });
  return res.status(201).json(address);
});

router.put("/:id", async (req, res) => {
  const address = await Address.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
  if (!address) return res.status(404).json({ message: "Address not found" });
  return res.json(address);
});

router.delete("/:id", async (req, res) => {
  await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  return res.json({ ok: true });
});

module.exports = router;
