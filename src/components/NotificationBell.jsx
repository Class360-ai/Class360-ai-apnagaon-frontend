import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/useNotifications";

const NotificationBell = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      type="button"
      onClick={() => navigate("/notifications")}
      className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/95 shadow-sm ring-1 ring-white/30 transition hover:bg-white"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-emerald-700" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-rose-500 to-orange-500 px-1 text-[10px] font-black text-white shadow-md shadow-rose-100">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
};

export default NotificationBell;
