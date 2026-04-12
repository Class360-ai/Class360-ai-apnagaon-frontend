const parseList = (value, fallback = []) => {
  if (!value) return fallback;
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  return value && String(value).trim() ? String(value).trim() : fallback;
};

const getCorsOrigins = () => {
  const origins = [
    ...parseList(getEnv("CORS_ORIGIN", ""), []),
    ...parseList(getEnv("FRONTEND_URL", ""), []),
  ].filter(Boolean);

  if (!origins.length) {
    return ["*", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"];
  }

  if (origins.includes("*")) {
    return ["*", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"];
  }

  return [...new Set([
    ...origins,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
  ])];
};

module.exports = {
  getEnv,
  getCorsOrigins,
};
