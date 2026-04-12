const express = require("express");
const mongoose = require("mongoose");
const { seedProductsInDatabase } = require("../utils/productSeeder");

const router = express.Router();

const seedProductsHandler = async (req, res, next) => {
  try {
    console.log(`[ApnaGaon] Seed products route hit: ${req.method} ${req.originalUrl}`);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        ok: false,
        message: "Database is not connected yet",
      });
    }

    const shopId = req.body?.shopId || req.query?.shopId || null;
    const inserted = await seedProductsInDatabase({ shopId });

    console.log(`[ApnaGaon] Inserted ${inserted.length} products into MongoDB`);

    return res.json({
      ok: true,
      message: `Inserted ${inserted.length} sample products`,
      count: inserted.length,
      products: inserted,
    });
  } catch (error) {
    return next(error);
  }
};

router.get("/seed-products", seedProductsHandler);
router.post("/seed-products", seedProductsHandler);

// Backward-compatible alias for older callers
router.get("/products/seed-products", seedProductsHandler);
router.post("/products/seed-products", seedProductsHandler);

module.exports = router;
