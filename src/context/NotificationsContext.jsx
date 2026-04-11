import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { notificationsAPI, safeFetch } from "../utils/api";
import { normalizeRole } from "../utils/roleUtils";
import {
  addLocalNotification,
  getLocalNotifications,
  getLocalUnreadCount,
  markAllLocalNotificationsRead,
  markLocalNotificationRead,
  seedLocalNotifications,
  LOCAL_NOTIFICATIONS_EVENT,
} from "../utils/notificationStorage";

export const NotificationsContext = createContext(null);

const getNotificationKey = (notification = {}) =>
  String(notification._id || notification.id || `${notification.title || ""}:${notification.createdAt || ""}`);

const sortLatest = (items = []) =>
  [...items].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

const mergeUnique = (lists = []) => {
  const seen = new Set();
  return lists.flat().filter((notification) => {
    const key = getNotificationKey(notification);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const NotificationsProvider = ({ children }) => {
  const auth = useAuth();
  const role = auth.isLoggedIn ? normalizeRole(auth.user?.role) : "guest";
  const userId = String(auth.user?.id || auth.user?._id || "").trim();
  const [notifications, setNotifications] = useState([]);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendNotificationsRef = useRef([]);

  useEffect(() => {
    backendNotificationsRef.current = backendNotifications;
  }, [backendNotifications]);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      setLoading(true);
      const localScope = { role, userId };
      const localList = getLocalNotifications(localScope);
      const backendList = auth.isLoggedIn ? await safeFetch(() => notificationsAPI.getAll(), null) : null;

      let next = [];
      if (Array.isArray(backendList)) {
        const normalizedBackend = backendList.map((item) => ({
          ...item,
          id: item.id || item._id || getNotificationKey(item),
          role: normalizeRole(item.role || role),
        }));
        setBackendNotifications(normalizedBackend);
        backendNotificationsRef.current = normalizedBackend;
        next = mergeUnique([normalizedBackend, localList]);
      } else {
        setBackendNotifications([]);
        backendNotificationsRef.current = [];
        if (auth.isLoggedIn && !localList.length && role && role !== "guest") {
          seedLocalNotifications(localScope);
        }
        next = getLocalNotifications(localScope);
      }

      if (!mounted) return;
      setNotifications(sortLatest(next));
      setLoading(false);
    };

    loadNotifications();

    const syncLocal = () => {
      const scoped = getLocalNotifications({ role, userId });
      setNotifications(sortLatest(mergeUnique([backendNotificationsRef.current, scoped])));
    };

    window.addEventListener(LOCAL_NOTIFICATIONS_EVENT, syncLocal);
    window.addEventListener("storage", syncLocal);

    return () => {
      mounted = false;
      window.removeEventListener(LOCAL_NOTIFICATIONS_EVENT, syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, [auth.isLoggedIn, role, userId]);

  const refresh = async () => {
    const localScope = { role, userId };
    const backendList = auth.isLoggedIn ? await safeFetch(() => notificationsAPI.getAll(), null) : null;
    const localList = getLocalNotifications(localScope);
    const normalizedBackend = Array.isArray(backendList)
      ? backendList.map((item) => ({
          ...item,
          id: item.id || item._id || getNotificationKey(item),
          role: normalizeRole(item.role || role),
        }))
      : backendNotificationsRef.current;
    const next = mergeUnique([normalizedBackend, localList]);
    if (Array.isArray(backendList)) {
      setBackendNotifications(normalizedBackend);
      backendNotificationsRef.current = normalizedBackend;
    }
    setNotifications(sortLatest(next));
    return next;
  };

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  const markRead = async (notification) => {
    if (!notification) return null;
    const targetId = notification._id || notification.id;

    if (auth.isLoggedIn && notification._id) {
      const result = await safeFetch(() => notificationsAPI.readOne(notification._id), null);
      if (result) {
        setNotifications((prev) =>
          sortLatest(
            prev.map((item) => (getNotificationKey(item) === getNotificationKey(notification) ? { ...item, read: true } : item))
          )
        );
        setBackendNotifications((prev) =>
          prev.map((item) => (getNotificationKey(item) === getNotificationKey(notification) ? { ...item, read: true } : item))
        );
        markLocalNotificationRead(targetId, { role, userId });
        return result;
      }
    }

    const updated = markLocalNotificationRead(targetId, { role, userId });
    if (updated) {
      setNotifications((prev) =>
        sortLatest(prev.map((item) => (getNotificationKey(item) === getNotificationKey(updated) ? updated : item)))
      );
    }
    return updated;
  };

  const markAllRead = async () => {
    if (auth.isLoggedIn) {
      const result = await safeFetch(() => notificationsAPI.readAll(), null);
      if (result) {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        setBackendNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        markAllLocalNotificationsRead({ role, userId });
        return true;
      }
    }

    const updated = markAllLocalNotificationsRead({ role, userId });
    setNotifications(sortLatest(updated));
    return true;
  };

  const addNotification = async (notification, scope = {}) => {
    const next = addLocalNotification(notification, { role, userId, ...scope });
    setNotifications((prev) => sortLatest(mergeUnique([[next], prev])));
    return next;
  };

  const value = useMemo(
    () => ({
      notifications,
      loading,
      unreadCount,
      refresh,
      markRead,
      markAllRead,
      addNotification,
      role,
      userId,
      hasNotifications: notifications.length > 0,
      localUnreadCount: getLocalUnreadCount({ role, userId }),
    }),
    [notifications, loading, unreadCount, role, userId]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
