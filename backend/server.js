const express = require("express");
const mongoose = require("mongoose");
const shopRoutes = require("./routes/shopRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const addressRoutes = require("./routes/addressRoutes");
const productRoutes = require("./routes/productRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const servicePartnerRoutes = require("./routes/servicePartnerRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const adminPartnerRoutes = require("./routes/adminPartnerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { getEnv, getCorsOrigins } = require("./utils/env");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = getEnv("PORT", "5000");
const mongoUri = getEnv("MONGO_URI", "mongodb://127.0.0.1:27017/apnagaon");
const nodeEnv = getEnv("NODE_ENV", "development");
const corsOrigins = getCorsOrigins();

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
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});

app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    env: nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/partners", partnerRoutes);
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
    app.listen(port, () => {
      console.log(`ApnaGaon API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });

module.exports = app;
