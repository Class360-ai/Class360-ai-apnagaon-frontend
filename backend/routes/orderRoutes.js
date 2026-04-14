const express = require("express");
const { createOrder, getOrders, getMyOrders, getOrder, updateOrderStatus, assignDeliveryPartner } = require("../controllers/orderController");
const { requireAuth, optionalAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/orders", requireAuth, roleCheck("owner", "shop_admin", "delivery"), getOrders);
router.get("/orders/me", requireAuth, getMyOrders);
router.get("/orders/:id", getOrder);
router.patch("/orders/:id/status", requireAuth, roleCheck("owner", "shop_admin", "delivery"), updateOrderStatus);
router.put("/orders/:id/status", requireAuth, roleCheck("owner", "shop_admin", "delivery"), updateOrderStatus);
router.put("/orders/:id/assign", requireAuth, roleCheck("owner"), assignDeliveryPartner);
router.put("/orders/:id/assign-rider", requireAuth, roleCheck("owner"), (req, res, next) => {
  console.log("[ApnaGaon] /api/orders/:id/assign-rider route hit", {
    method: req.method,
    path: req.originalUrl,
    orderId: req.params.id,
    riderId: req.body?.riderId || req.body?.deliveryPartnerId || null,
  });
  return assignDeliveryPartner(req, res, next);
});

module.exports = router;
