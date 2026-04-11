const express = require("express");
const User = require("../models/User");
const Address = require("../models/Address");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { createToken, requireAuth } = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

const seedDemoUsers = async () => {
  const count = await User.countDocuments();
  if (count) return;
  await User.create([
    { name: "ApnaGaon Admin", email: "admin@apnagaon.local", phone: "9876543210", role: "admin", passwordHash: User.hashPassword("admin123") },
    { name: "Shop Partner", email: "shop@apnagaon.local", phone: "9876543211", role: "shop", passwordHash: User.hashPassword("shop123") },
    { name: "Delivery Rider", email: "rider@apnagaon.local", phone: "9876543212", role: "rider", passwordHash: User.hashPassword("rider123") },
    { name: "Delivery Partner", email: "delivery@apnagaon.local", phone: "9876543213", role: "delivery", passwordHash: User.hashPassword("delivery123") },
  ]);
};

router.post("/login", async (req, res) => {
  await seedDemoUsers();
  const identifier = String(req.body.email || req.body.phone || req.body.identifier || "").trim().toLowerCase();
  const password = req.body.password || "";
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: String(req.body.phone || req.body.identifier || "").trim() }],
  });
  if (!user || !user.verifyPassword(password)) return res.status(401).json({ message: "Invalid email or password" });
  const safeUser = { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, shopId: user.shopId, preferences: user.preferences || {} };
  return res.json({ token: createToken(user), user: safeUser });
});

router.post("/register", async (req, res) => {
  await seedDemoUsers();
  const { name, phone, password, email = "", village = "", address = "" } = req.body;
  if (!String(name || "").trim() || !String(phone || "").trim() || !String(password || "").trim()) {
    return res.status(400).json({ message: "Name, phone, and password are required" });
  }
  const existing = await User.findOne({ $or: [{ phone: String(phone).trim() }, { email: String(email).trim().toLowerCase() }] });
  if (existing) return res.status(409).json({ message: "User already exists" });
  const user = await User.create({
    name,
    phone: String(phone).trim(),
    email: String(email || `guest_${String(phone).trim()}@apnagaon.local`).toLowerCase(),
    role: "customer",
    passwordHash: User.hashPassword(password),
    preferences: {
      village: String(village || "").trim(),
      address: String(address || "").trim(),
    },
  });
  return res.json({ token: createToken(user), user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, preferences: user.preferences || {} } });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = req.user;
  const [addresses, orders, unreadCount] = user.role === "customer"
    ? await Promise.all([
        Address.find({ userId: user._id }).sort({ updatedAt: -1 }),
        Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
        Notification.countDocuments({ userId: user._id, read: false }),
      ])
    : [[], [], 0];
  return res.json({
    user: {
      ...user.toObject(),
      addresses,
      orders,
      unreadCount,
    },
  });
});

router.put("/me", requireAuth, async (req, res) => {
  const { name, phone, preferences = {} } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(String(name || "").trim() ? { name } : {}),
      ...(String(phone || "").trim() ? { phone } : {}),
      preferences,
    },
    { new: true }
  ).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});

router.post("/logout", requireAuth, (req, res) => {
  return res.json({ ok: true });
});

router.get("/users", requireAuth, roleCheck("admin"), async (req, res) => {
  const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 }).limit(100);
  return res.json(users);
});

module.exports = router;
