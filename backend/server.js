require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const shopRoutes = require("./routes/shopRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const addressRoutes = require("./routes/addressRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const deliveryPartnerRoutes = require("./routes/deliveryPartnerRoutes");
const servicePartnerRoutes = require("./routes/servicePartnerRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const adminPartnerRoutes = require("./routes/adminPartnerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const Order = require("./models/Order");
const { getEnv, getCorsOrigins } = require("./utils/env");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const seedRoutes = require("./routes/seedProducts");

const app = express();
const PORT = process.env.PORT || 5000;
const nodeEnv = getEnv("NODE_ENV", "development");
const mongoUri = process.env.MONGO_URI || (nodeEnv === "production" ? "" : "mongodb://127.0.0.1:27017/apnagaon");
const corsOrigins = getCorsOrigins();

if (!mongoUri) {
  console.error("MONGO_URI is required in production.");
  process.exit(1);
}

const corsOptions = {
  origin: (origin, callback) => {
    const isLocalDevOrigin =
      typeof origin === "string" &&
      /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

    if (!origin || isLocalDevOrigin || corsOrigins.includes("*") || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use((req, res, next) => {
  if (nodeEnv !== "production") {
    const startedAt = Date.now();
    res.on("finish", () => {
      const elapsed = Date.now() - startedAt;
      console.log(`[ApnaGaon] ${req.method} ${req.originalUrl} ${res.statusCode} ${elapsed}ms`);
    });
  }
  next();
});
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    env: nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
);
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api", seedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/delivery-partners", deliveryPartnerRoutes);
app.use("/api/service-partners", servicePartnerRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin", adminPartnerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log(`[ApnaGaon] MongoDB connected to database: ${mongoose.connection.name}`);
    console.log(`[ApnaGaon] Using collection: ${Order.collection.name}`);
    app.listen(PORT, () => {
      console.log(`ApnaGaon API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });

module.exports = app;
