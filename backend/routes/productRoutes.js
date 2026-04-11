const express = require("express");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", async (req, res) => {
  const filter = req.query.shopId ? { shopId: req.query.shopId } : {};
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200);
  return res.json(products);
});

router.post("/", requireAuth, roleCheck("admin", "shop"), async (req, res) => {
  const product = await Product.create({ ...req.body, shopId: req.body.shopId || req.user.shopId || null });
  return res.status(201).json(product);
});

router.put("/:id", requireAuth, roleCheck("admin", "shop"), async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  return res.json(product);
});

router.delete("/:id", requireAuth, roleCheck("admin", "shop"), async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
});

module.exports = router;
