const { roleMatches, TEMP_ADMIN_MODE } = require("../utils/roleUtils");

const roleCheck = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (TEMP_ADMIN_MODE) return next();
  if (!roleMatches(req.user.role, allowedRoles)) {
    return res.status(403).json({ message: "Not allowed for this role" });
  }
  return next();
};

module.exports = roleCheck;
