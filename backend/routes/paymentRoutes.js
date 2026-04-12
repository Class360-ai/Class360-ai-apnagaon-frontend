const express = require("express");
const { requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const {
  createPayment,
  getPayment,
  getPaymentByOrderId,
  verifyPayment,
  updatePaymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/", requireAuth, createPayment);
router.get("/order/:orderId", requireAuth, getPaymentByOrderId);
router.get("/:id", requireAuth, getPayment);
router.post("/:id/verify", requireAuth, verifyPayment);
router.patch("/:id/status", requireAuth, roleCheck("owner"), updatePaymentStatus);

module.exports = router;
