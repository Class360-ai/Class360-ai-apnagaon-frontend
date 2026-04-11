const express = require("express");
const { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus, assignDeliveryPartner } = require("../controllers/orderController");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/", requireAuth, getOrders);
router.get("/me", requireAuth, getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/status", requireAuth, updateOrderStatus);
router.put("/:id/assign", requireAuth, roleCheck("admin"), assignDeliveryPartner);

module.exports = router;
