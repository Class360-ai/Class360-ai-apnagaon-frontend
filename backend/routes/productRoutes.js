const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { seedProductsInDatabase } = require("../utils/productSeeder");
const { normalizeRole } = require("../utils/roleUtils");

const router = express.Router();

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const filter = {};
    const normalizedRole = normalizeRole(req.user?.role);
    if (req.query.shopId) {
      if (normalizedRole === "shop_admin" && String(req.query.shopId) !== String(req.user?.shopId || "")) {
        return res.status(403).json({ message: "Not allowed to view products outside your shop" });
      }
      filter.shopId = req.query.shopId;
    } else if (normalizedRole === "shop_admin" && req.user?.shopId) {
      filter.shopId = req.user.shopId;
    }
    if (req.query.category) {
      filter.category = String(req.query.category).trim();
    }
    if (req.query.available === "true") {
      filter.available = true;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200);
    return res.json(products);
  } catch (error) {
    return next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) {
      return res.json([]);
    }

    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { unit: searchRegex },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(products);
  } catch (error) {
    return next(error);
  }
});

router.get("/category/:category", async (req, res, next) => {
  try {
    const category = String(req.params.category || "").trim();
    const products = await Product.find({
      category: new RegExp(`^${category}$`, "i"),
    })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(products);
  } catch (error) {
    return next(error);
  }
});

router.post("/seed-products", async (req, res, next) => {
  try {
    const inserted = await seedProductsInDatabase({ shopId: req.body?.shopId || null });
    return res.json({
      ok: true,
      count: inserted.length,
      products: inserted,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (normalizeRole(req.user?.role) === "shop_admin" && String(product.shopId || "") !== String(req.user.shopId || "")) {
      return res.status(403).json({ message: "Not allowed to access products outside your shop" });
    }
    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

router.post("/", requireAuth, roleCheck("owner", "shop_admin"), async (req, res, next) => {
  try {
    const normalizedRole = normalizeRole(req.user?.role);
    const product = await Product.create({
      ...req.body,
      shopId: normalizedRole === "shop_admin" ? req.user.shopId || null : req.body.shopId || req.user.shopId || null,
    });
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", requireAuth, roleCheck("owner", "shop_admin"), async (req, res, next) => {
  try {
    const normalizedRole = normalizeRole(req.user?.role);
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });
    if (normalizedRole === "shop_admin" && String(existing.shopId || "") !== String(req.user.shopId || "")) {
      return res.status(403).json({ message: "Not allowed to update products outside your shop" });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", requireAuth, roleCheck("owner", "shop_admin"), async (req, res, next) => {
  try {
    const normalizedRole = normalizeRole(req.user?.role);
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Product not found" });
    if (normalizedRole === "shop_admin" && String(existing.shopId || "") !== String(req.user.shopId || "")) {
      return res.status(403).json({ message: "Not allowed to delete products outside your shop" });
    }
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
