const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

const FALLBACK_CATEGORIES = [
  { slug: "grocery", name: "Grocery", type: "product", active: true, sortOrder: 1 },
  { slug: "food", name: "Food", type: "product", active: true, sortOrder: 2 },
  { slug: "services", name: "Services", type: "service", active: true, sortOrder: 3 },
  { slug: "water-gas", name: "Water & Gas", type: "product", active: true, sortOrder: 4 },
  { slug: "medicines", name: "Medicines", type: "product", active: true, sortOrder: 5 },
];

const titleize = (value = "") =>
  String(value)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find({}).select("category").lean();
    const categories = new Map();

    FALLBACK_CATEGORIES.forEach((category) => {
      categories.set(category.slug, { ...category });
    });

    products.forEach((product) => {
      const slug = String(product.category || "").trim().toLowerCase();
      if (!slug) return;
      if (!categories.has(slug)) {
        categories.set(slug, {
          slug,
          name: titleize(slug),
          type: slug === "services" ? "service" : "product",
          active: true,
          sortOrder: categories.size + 1,
        });
      }
    });

    return res.json(Array.from(categories.values()).sort((a, b) => a.sortOrder - b.sortOrder));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
