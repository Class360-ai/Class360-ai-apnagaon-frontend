const roleCheck = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Not allowed for this role" });
  return next();
};

module.exports = roleCheck;
