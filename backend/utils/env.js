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
  const origin = getEnv("CORS_ORIGIN", "*");
  return origin === "*" ? ["*"] : parseList(origin, [origin]);
};

module.exports = {
  getEnv,
  getCorsOrigins,
};
