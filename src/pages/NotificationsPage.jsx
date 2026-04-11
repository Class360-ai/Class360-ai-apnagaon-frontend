import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing, CheckCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useNotifications } from "../context/useNotifications";
import NotificationList from "../components/NotificationList";
import { getRoleLabel } from "../utils/roleUtils";

const toneMap = {
  admin: "from-rose-500 via-orange-500 to-amber-400",
  shop: "from-emerald-600 via-emerald-500 to-lime-400",
  delivery: "from-sky-600 via-indigo-500 to-violet-500",
  customer: "from-emerald-600 via-orange-500 to-amber-400",
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { notifications, loading, unreadCount, markRead, markAllRead, role } = useNotifications();

  const roleLabel = auth.isLoggedIn ? getRoleLabel(role || auth.user?.role) : "Guest";
  const tone = toneMap[role] || toneMap.customer;

  const stats = useMemo(
    () => [
      { label: "Unread", value: unreadCount },
      { label: "Total", value: notifications.length },
    ],
    [notifications.length, unreadCount]
  );

  const handleOpen = async (notification) => {
    const next = await markRead(notification);
    const destination = notification?.link || next?.link;
    if (destination) navigate(destination);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-4">
      <main className="mx-auto max-w-md space-y-4">
        <div className={`rounded-[28px] bg-gradient-to-r ${tone} p-[1px] shadow-lg shadow-emerald-100`}>
          <div className="rounded-[27px] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-2xl bg-slate-50 p-3 text-slate-700 ring-1 ring-slate-100"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Notifications</p>
                  <h1 className="mt-1 text-2xl font-black text-slate-950">Inbox</h1>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {auth.isLoggedIn ? `${roleLabel} updates, alerts, and reminders.` : "Updates for signed-in users appear here."}
                  </p>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <BellRing className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[22px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
          <div className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Role filtered
          </div>
        </div>

        <NotificationList
          notifications={notifications}
          loading={loading}
          onOpen={handleOpen}
          emptyTitle={auth.isLoggedIn ? "No notifications yet" : "Sign in to see notifications"}
          emptyDescription={
            auth.isLoggedIn
              ? "Order updates, shop alerts, delivery status, and rewards will appear here."
              : "Login to receive order, shop, and delivery updates."
          }
          emptyAction={() => navigate(auth.isLoggedIn ? "/" : "/login")}
          emptyActionText={auth.isLoggedIn ? "Browse ApnaGaon" : "Go to login"}
        />
      </main>
    </div>
  );
};

export default NotificationsPage;
