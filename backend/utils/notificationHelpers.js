const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotificationPayload = ({ userId, role = "", title, message, type = "system", read = false, link = "", orderId = "", meta = {} }) => ({
  userId,
  role,
  title,
  message,
  type,
  read,
  link,
  orderId,
  meta,
});

const notifyUsers = async (userIds = [], notification = {}) => {
  const ids = [...new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean))];
  if (!ids.length) return [];
  return Notification.insertMany(ids.map((userId) => createNotificationPayload({ ...notification, userId })));
};

const notifyRoleUsers = async (role, notification = {}) => {
  const users = await User.find({ role }).select("_id").lean();
  return notifyUsers(users.map((user) => user._id), { ...notification, role });
};

module.exports = {
  notifyUsers,
  notifyRoleUsers,
  createNotificationPayload,
};
