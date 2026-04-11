import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, FileText, LifeBuoy, LogOut, MapPin, ShieldCheck, Settings2, Sparkles } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { DEFAULT_NOTIFICATION_PREFERENCES, getLaunchSettings, updateNotificationPreference } from "../utils/settingsStorage";

const QUICK_LINKS = [
  { label: "Saved Addresses", path: "/checkout/address", icon: MapPin },
  { label: "Help & Support", path: "/help", icon: LifeBuoy },
  { label: "Privacy Policy", path: "/privacy-policy", icon: ShieldCheck },
  { label: "Terms & Conditions", path: "/terms", icon: FileText },
  { label: "Refund Policy", path: "/refund-policy", icon: FileText },
  { label: "Delivery Policy", path: "/delivery-policy", icon: FileText },
];

const READINESS_CHECKS = [
  "Protected routes are locked for every role.",
  "Checkout, payment, and tracking all have safe fallbacks.",
  "Orders, notifications, and addresses degrade gracefully if the backend is unavailable.",
  "Admin, shop, and delivery dashboards keep role-based access in place.",
];

const SettingToggle = ({ label, description, value, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-[22px] bg-slate-50 p-4 ring-1 ring-slate-100">
    <div className="min-w-0">
      <p className="text-sm font-black text-slate-950">{label}</p>
      <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-8 w-14 flex-none items-center rounded-full px-1 transition ${
        value ? "bg-emerald-600" : "bg-slate-300"
      }`}
      aria-pressed={value}
      aria-label={label}
    >
      <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition ${value ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [settings, setSettings] = useState(() => getLaunchSettings());
  const [showAllChecks, setShowAllChecks] = useState(false);

  const notificationPreferences = useMemo(
    () => ({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(settings.notificationPreferences || {}),
    }),
    [settings]
  );

  const updateToggle = (key, value) => {
    const next = updateNotificationPreference(key, value);
    setSettings(next);
  };

  const handleLogout = async () => {
    auth.logout();
    navigate("/");
  };

  return (
    <LaunchPageShell
      icon={Settings2}
      eyebrow="Account settings"
      title="Settings"
      subtitle="Keep your ApnaGaon experience tidy, trusted, and ready for everyday use."
      highlights={["Language", "Addresses", "Support", "Trust"]}
    >
      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Language</p>
            <h2 className="mt-1 text-base font-black text-slate-950">Choose your preferred language</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">English + Hindi support is ready for checkout and support screens.</p>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100"
          >
            {language === "en" ? "हिन्दी" : "English"}
          </button>
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-700" />
          <div>
            <h2 className="text-base font-black text-slate-950">Notification preferences</h2>
            <p className="text-xs font-medium text-slate-500">Choose what you want to hear about.</p>
          </div>
        </div>
        <div className="space-y-2">
          <SettingToggle
            label="Order updates"
            description="Placed, confirmed, preparing, and delivered alerts."
            value={notificationPreferences.orderUpdates}
            onChange={(value) => updateToggle("orderUpdates", value)}
          />
          <SettingToggle
            label="Delivery alerts"
            description="Assigned rider, on the way, and delayed updates."
            value={notificationPreferences.deliveryAlerts}
            onChange={(value) => updateToggle("deliveryAlerts", value)}
          />
          <SettingToggle
            label="Rewards and offers"
            description="Cashback, free delivery, and fresh local offers."
            value={notificationPreferences.offers}
            onChange={(value) => updateToggle("offers", value)}
          />
          <SettingToggle
            label="Reward reminders"
            description="Get a nudge before rewards expire."
            value={notificationPreferences.rewards}
            onChange={(value) => updateToggle("rewards", value)}
          />
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Shortcuts</p>
            <h2 className="mt-1 text-base font-black text-slate-950">Saved places and support</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Jump straight to the things you use most.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex items-center justify-between gap-3 rounded-[20px] bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100 transition hover:bg-slate-100"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-950">{item.label}</span>
                    <span className="block text-[11px] font-medium text-slate-500">Open quickly</span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] bg-gradient-to-br from-emerald-50 to-orange-50 p-4 ring-1 ring-emerald-100">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-700" />
          <h2 className="text-base font-black text-slate-950">Launch readiness</h2>
        </div>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
          A quick internal checklist so the app stays safe while we keep polishing the business flow.
        </p>
        <button
          type="button"
          onClick={() => setShowAllChecks((value) => !value)}
          className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100"
        >
          {showAllChecks ? "Hide checklist" : "Show checklist"}
        </button>
        {showAllChecks ? (
          <ul className="mt-3 space-y-2">
            {READINESS_CHECKS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-[18px] bg-white px-3 py-3 text-xs font-medium leading-5 text-slate-600 shadow-sm ring-1 ring-emerald-50"
              >
                <span className="mt-0.5 h-2.5 w-2.5 flex-none rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
        >
          Back to Profile
        </button>
        {auth.isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-full bg-gradient-to-r from-emerald-600 to-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100"
          >
            Sign in
          </button>
        )}
      </section>
    </LaunchPageShell>
  );
};

export default SettingsPage;
