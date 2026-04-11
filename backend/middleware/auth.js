const crypto = require("crypto");
const User = require("../models/User");

const AUTH_SECRET = process.env.JWT_SECRET || "apnagaon-dev-secret";

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const decode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

const signPayload = (payload) =>
  crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");

const createToken = (user) => {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return `${header}.${payload}.${signPayload(`${header}.${payload}`)}`;
};

const verifyToken = (token) => {
  const [header, payload, signature] = String(token || "").split(".");
  if (!header || !payload || !signature) return null;
  if (signPayload(`${header}.${payload}`) !== signature) return null;
  const data = decode(payload);
  if (!data.exp || data.exp < Date.now()) return null;
  return data;
};

const requireAuth = async (req, res, next) => {
  const token = String(req.headers.authorization || "").replace("Bearer ", "");
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: "Authentication required" });
  const user = await User.findById(payload.id).select("-passwordHash");
  if (!user) return res.status(401).json({ message: "User not found" });
  req.user = user;
  return next();
};

const optionalAuth = async (req, res, next) => {
  const token = String(req.headers.authorization || "").replace("Bearer ", "");
  const payload = verifyToken(token);
  if (!payload) return next();
  const user = await User.findById(payload.id).select("-passwordHash");
  if (user) req.user = user;
  return next();
};

module.exports = {
  createToken,
  requireAuth,
  optionalAuth,
  verifyToken,
};
