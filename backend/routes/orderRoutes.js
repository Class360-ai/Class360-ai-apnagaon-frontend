const express = require("express");
const { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus, assignDeliveryPartner } = require("../controllers/orderController");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/", requireAuth, roleCheck("owner", "shop_admin", "delivery"), getOrders);
router.get("/me", requireAuth, getMyOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", requireAuth, roleCheck("owner", "shop_admin", "delivery"), updateOrderStatus);
router.put("/:id/status", requireAuth, roleCheck("owner", "shop_admin", "delivery"), updateOrderStatus);
router.put("/:id/assign", requireAuth, roleCheck("owner"), assignDeliveryPartner);

module.exports = router;
