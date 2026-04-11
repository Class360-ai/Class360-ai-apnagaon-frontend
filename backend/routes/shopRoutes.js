const express = require("express");
const { createShop, getNearbyShops, getShops, updateShop } = require("../controllers/shopController");

const router = express.Router();

router.get("/", getShops);
router.post("/", createShop);
router.put("/:id", updateShop);
router.get("/nearby", getNearbyShops);

module.exports = router;
