const express = require("express");
const { createService, getNearbyServices, getServices } = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getServices);
router.post("/", createService);
router.get("/nearby", getNearbyServices);

module.exports = router;
