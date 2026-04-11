import React from "react";
import { ChevronRight, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const toneClass = {
  order_update: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  offer: "bg-orange-50 text-orange-700 ring-orange-100",
  reward: "bg-violet-50 text-violet-700 ring-violet-100",
  system: "bg-slate-50 text-slate-700 ring-slate-100",
};

const formatRelativeTime = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.max(1, Math.round(minutes / 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.max(1, Math.round(hours / 24));
  return `${days}d ago`;
};

const NotificationCard = ({ notification, onOpen }) => {
  const navigate = useNavigate();
  const tone = toneClass[notification?.type] || toneClass.system;

  const handleOpen = () => {
    if (typeof onOpen === "function") {
      onOpen(notification);
      return;
    }
    if (notification?.link) {
      navigate(notification.link);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`group w-full rounded-[24px] bg-white p-4 text-left shadow-sm ring-1 transition ${
        notification?.read ? "ring-slate-100" : "ring-emerald-200 shadow-emerald-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${tone}`}>
          <Circle className="h-3.5 w-3.5 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ${tone}`}>
              {notification?.type || "system"}
            </div>
            {!notification?.read ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> : null}
          </div>
          <h3 className="mt-3 text-sm font-black text-slate-950">{notification?.title || "Update"}</h3>
          <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{notification?.message || ""}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {formatRelativeTime(notification?.createdAt)}
            </p>
            {notification?.link ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                Open
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
};

export default NotificationCard;
