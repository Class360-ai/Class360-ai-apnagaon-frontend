const express = require("express");
const { createShop, getNearbyShops, getShops, updateShop } = require("../controllers/shopController");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.get("/", getShops);
router.post("/", requireAuth, roleCheck("owner"), createShop);
router.put("/:id", requireAuth, roleCheck("owner"), updateShop);
router.get("/nearby", getNearbyShops);

module.exports = router;
