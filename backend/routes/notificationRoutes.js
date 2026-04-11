const express = require("express");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return res.json(notifications);
});

router.get("/unread-count", async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user._id, read: false });
  return res.json({ count });
});

router.patch("/:id/read", async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  return res.json(notification);
});

router.patch("/read-all", async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  return res.json({ ok: true });
});

module.exports = router;
