import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Edit2, LogOut, MapPin, Save, Settings2, ShieldCheck, X } from "lucide-react";
import Header from "../components/Header";
import OrderStatusBadge from "../components/OrderStatusBadge";
import useTranslation from "../utils/useTranslation";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/useAuth";
import { addressesAPI, ordersAPI, safeFetch } from "../utils/api";
import { getReferralData, generateReferralCode, saveReferralData, claimReward, getReferralStats } from "../utils/referralUtils";
import { formatPrice } from "../utils/helpers";
import { getLocalOrders } from "../utils/orderStorage";
import { getSavedAddresses } from "../utils/locationHelpers";

const createProfileDraft = (sourceUser = {}, fallbackUser = {}) => ({
  name: sourceUser?.name || fallbackUser?.name || "",
  phone: sourceUser?.phone || fallbackUser?.phone || "",
  village: sourceUser?.preferences?.village || sourceUser?.village || fallbackUser?.village || "",
  address: sourceUser?.preferences?.address || sourceUser?.address || fallbackUser?.address || "",
  email: sourceUser?.email || fallbackUser?.email || "",
});

const renderAddress = (address = {}) =>
  [address.house, address.area, address.city, address.state, address.pincode].filter(Boolean).join(", ");
const mergeOrders = (...lists) => {
  const seen = new Set();
  return lists.flat().filter((order) => {
    const key = String(order?.orderId || order?.id || order?._id || order?.createdAt || order?.updatedAt || "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const mergeAddresses = (...lists) => {
  const seen = new Set();
  return lists.flat().filter((address) => {
    const key = String(address?.id || address?._id || `${address?.label || ""}:${address?.fullName || ""}:${address?.pincode || ""}`);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const ProfilePage = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { language, toggleLanguage } = useLanguage();
  const auth = useAuth();
  const loggedIn = auth.isLoggedIn;
  const activeUser = loggedIn ? auth.user : user;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => createProfileDraft(auth.user, user));
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [referralData, setReferralData] = useState(getReferralData());
  const referralStats = getReferralStats();
  const referralViewData = {
    ...referralData,
    referralCode: referralData.referralCode || (activeUser?.phone ? generateReferralCode(String(activeUser.phone).replace(/\D/g, "")) : ""),
  };

  useEffect(() => {
    const loadAccountData = async () => {
      if (loggedIn) {
        const ordersResult = await safeFetch(() => ordersAPI.getMine(), auth.user?.orders || []);
        setRecentOrders(mergeOrders(Array.isArray(ordersResult) ? ordersResult : [], auth.user?.orders || [], getLocalOrders()));

        const addressesResult = await safeFetch(() => addressesAPI.getAll(), auth.user?.addresses || []);
        setSavedAddresses(mergeAddresses(Array.isArray(addressesResult) ? addressesResult : [], auth.user?.addresses || [], getSavedAddresses()));
        return;
      }

      setRecentOrders(getLocalOrders());
      setSavedAddresses(getSavedAddresses());
    };

    loadAccountData();
  }, [auth.user, loggedIn]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    if (loggedIn) {
      await auth.updateProfile({
        name: formData.name,
        phone: formData.phone,
        preferences: {
          ...(auth.user?.preferences || {}),
          village: formData.village,
          address: formData.address,
          email: formData.email,
        },
      });
      updateUser({
        name: formData.name,
        phone: formData.phone,
        village: formData.village,
        address: formData.address,
        email: formData.email,
      });
      setIsEditing(false);
      setLoading(false);
      return;
    }

    updateUser(formData);
    setIsEditing(false);
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (window.confirm(lang === "hi" ? "क्या आप साइन आउट करना चाहते हैं?" : "Are you sure you want to sign out?")) {
      auth.logout();
      navigate("/");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header onLocationClick={() => navigate("/profile")} />

      <div className="max-w-md mx-auto p-4">
        <section className="mb-4 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-gray-100">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">{loggedIn ? "Customer profile" : "Guest profile"}</p>
                <h1 className="mt-1 text-2xl font-black">{loggedIn ? "My Profile" : t("myAccount")}</h1>
                <p className="mt-2 text-sm font-semibold text-white/90">{loggedIn ? "Saved preferences, addresses, and order history" : "Manage your village account details"}</p>
              </div>
              <button
                onClick={() => {
                  if (!isEditing) setFormData(createProfileDraft(activeUser, user));
                  setIsEditing((value) => !value);
                }}
                className={`rounded-2xl p-2 transition ${
                  isEditing ? "bg-white/15 text-white ring-1 ring-white/20" : "bg-white text-emerald-700 shadow-sm"
                }`}
                aria-label={isEditing ? "Close editing" : "Edit profile"}
              >
                {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            <div className="rounded-[20px] bg-emerald-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">Orders</p>
              <p className="mt-1 text-lg font-black text-slate-950">{recentOrders.length}</p>
            </div>
            <div className="rounded-[20px] bg-orange-50 p-3">
              <p className="text-[11px] font-black uppercase tracking-wide text-orange-700">Addresses</p>
              <p className="mt-1 text-lg font-black text-slate-950">{savedAddresses.length}</p>
            </div>
          </div>
        </section>

        {loggedIn ? (
          <div className="mb-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Bell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Logged in</p>
                <h2 className="truncate text-lg font-black text-gray-950">{activeUser?.name || "ApnaGaon Customer"}</h2>
                <p className="text-xs font-semibold text-gray-500">{activeUser?.phone || "Phone not available"} · {activeUser?.role || "customer"}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-gray-600">
              <div className="rounded-2xl bg-gray-50 p-3">Unread notifications<br /><span className="text-base text-gray-950">{Number(activeUser?.unreadCount) || 0}</span></div>
              <div className="rounded-2xl bg-gray-50 p-3">Saved addresses<br /><span className="text-base text-gray-950">{Array.isArray(savedAddresses) ? savedAddresses.length : 0}</span></div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100"
            >
              <Bell className="h-4 w-4" />
              Open Notifications
            </button>
          </div>
        ) : null}

        <div className="mb-4 rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-emerald-700" />
            <div>
              <h3 className="text-base font-black text-gray-950">Settings & support</h3>
              <p className="text-xs font-semibold text-gray-500">Quick access to launch-ready trust pages.</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="rounded-2xl bg-emerald-50 px-3 py-3 text-emerald-700 ring-1 ring-emerald-100"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => navigate("/help")}
              className="rounded-2xl bg-orange-50 px-3 py-3 text-orange-700 ring-1 ring-orange-100"
            >
              Help
            </button>
            <button
              type="button"
              onClick={() => navigate("/faq")}
              className="rounded-2xl bg-slate-50 px-3 py-3 text-slate-700 ring-1 ring-slate-100"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => navigate("/privacy-policy")}
              className="rounded-2xl bg-slate-50 px-3 py-3 text-slate-700 ring-1 ring-slate-100"
            >
              Privacy
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Secure, COD friendly, and support ready.</span>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-3 mb-6">
          <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100">
            <label className="text-sm text-gray-600 block mb-1">
              {t("phone")}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData?.phone || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-yellow-400"
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100">
            <label className="text-sm text-gray-600 block mb-1">
              {t("village")}
            </label>
            <input
              type="text"
              name="village"
              value={formData?.village || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-yellow-400"
              placeholder="Azamgarh"
            />
          </div>

          <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100">
            <label className="text-sm text-gray-600 block mb-1">
              {t("address")}
            </label>
            <textarea
              name="address"
              value={formData?.address || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-yellow-400 resize-none"
              rows="3"
              placeholder="Your address"
            />
          </div>

          <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100">
            <label className="text-sm text-gray-600 block mb-1">
              {t("email")}
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:border-yellow-400"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            disabled={loading}
          className="w-full bg-yellow-400 text-gray-800 font-bold py-3 rounded-full hover:bg-yellow-500 transition flex items-center justify-center gap-2 mb-4 shadow-sm disabled:bg-yellow-200"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? "Saving..." : t("save")}</span>
          </button>
        )}

        <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100 mb-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold">
              {t("preferredLanguage")}
            </label>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-yellow-400 rounded-lg hover:bg-yellow-500 transition font-semibold"
            >
              {language === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {lang === "hi"
              ? "अपनी पसंदीदा भाषा चुनें"
              : "Choose your preferred language"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-gray-950">Saved places</h3>
              <p className="text-xs font-semibold text-gray-500">Addresses and delivery notes are kept ready for checkout.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/checkout/address")}
              className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
            >
              Add address
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {(savedAddresses || []).length ? (
              savedAddresses.slice(0, 3).map((address) => (
                <div key={address.id || address._id} className="rounded-2xl bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-950">{address.label || "Saved address"}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">{address.fullName || activeUser?.name || "Customer"}</p>
                    </div>
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">{renderAddress(address)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-gray-50 p-3 text-xs font-semibold text-gray-500">No saved address yet. Add one for faster checkout.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-[22px] shadow-sm ring-1 ring-gray-100 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-gray-950">Recent orders</h3>
              <p className="text-xs font-semibold text-gray-500">Reorder any time from your order history.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/my-orders")}
              className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
            >
              View all
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {(recentOrders || []).length ? (
              recentOrders.slice(0, 2).map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                return (
                  <div key={order.id || order._id || order.orderId} className="rounded-2xl border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-950">#{order.orderId || order.id || "order"}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">{items.slice(0, 2).map((item) => item.name).filter(Boolean).join(", ") || "Items loaded from order history"}</p>
                      </div>
                      <OrderStatusBadge status={order.status || "placed"} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Today"}</span>
                      <span>{formatPrice(order.total || order.totals?.total || 0)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl bg-gray-50 p-3 text-xs font-semibold text-gray-500">No orders yet. Your first delivery will appear here.</p>
            )}
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-white p-4 rounded-xl mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {lang === "hi" ? "रेफरल प्रोग्राम" : "Referral Program"}
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{referralStats.successfulReferrals}</div>
              <div className="text-xs text-gray-600">
                {lang === "hi" ? "सफल रेफरल" : "Successful Referrals"}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{referralStats.pendingRewards}</div>
              <div className="text-xs text-gray-600">
                {lang === "hi" ? "लंबित इनाम" : "Pending Rewards"}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-sm text-gray-600 block mb-1">
              {lang === "hi" ? "आपका रेफरल कोड" : "Your Referral Code"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralViewData.referralCode || ""}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-center font-mono text-sm"
              />
              <button
                onClick={() => {
                  if (!referralData.referralCode && referralViewData.referralCode) {
                    saveReferralData(referralViewData);
                    setReferralData(referralViewData);
                  }
                  navigator.clipboard.writeText(referralViewData.referralCode || "");
                }}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-semibold"
              >
                {lang === "hi" ? "कॉपी" : "Copy"}
              </button>
            </div>
          </div>

          {referralViewData.pendingRewards.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                {lang === "hi" ? "लंबित इनाम" : "Pending Rewards"}
              </h4>
              {referralViewData.pendingRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg mb-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {lang === "hi" ? reward.itemNameHi : reward.itemName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(reward.dateEarned).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      claimReward(reward.id);
                      setReferralData(getReferralData());
                    }}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs font-semibold"
                  >
                    {lang === "hi" ? "क्लेम करें" : "Claim"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600">
            {lang === "hi"
              ? "दोस्त को रेफर करें और फ्री कोल्ड ड्रिंक या दूध पाएं!"
              : "Refer a friend and get a free cold drink or milk!"}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>{loggedIn ? "Sign out" : t("signOut")}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
