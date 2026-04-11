import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Phone, User } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getRoleHomePath, getRoleLabel, normalizeRole } from "../utils/roleUtils";

const staffAccounts = [
  { role: "Super Admin", email: "admin@apnagaon.local", password: "admin123", path: "/admin/dashboard" },
  { role: "Shop Owner", email: "shop@apnagaon.local", password: "shop123", path: "/shop/dashboard" },
  { role: "Delivery Partner", email: "rider@apnagaon.local", password: "rider123", path: "/delivery/dashboard" },
];

const emptyCustomer = {
  name: "",
  phone: "",
  password: "",
  email: "",
};

const fallbackPathForRole = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === "customer") return "/profile";
  return getRoleHomePath(normalized);
};

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("customer");
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [staffForm, setStaffForm] = useState({
    email: staffAccounts[0].email,
    password: staffAccounts[0].password,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectPath = useMemo(
    () => location.state?.from || fallbackPathForRole(auth.user?.role),
    [auth.user?.role, location.state?.from]
  );

  useEffect(() => {
    if (auth.isLoggedIn) {
      navigate(redirectPath, { replace: true });
    }
  }, [auth.isLoggedIn, navigate, redirectPath]);

  const updateCustomer = (key, value) => setCustomerForm((prev) => ({ ...prev, [key]: value }));
  const updateStaff = (key, value) => setStaffForm((prev) => ({ ...prev, [key]: value }));

  const submitCustomer = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const phone = String(customerForm.phone || "").trim();
    const password = String(customerForm.password || "").trim();
    const name = String(customerForm.name || "").trim();
    const email = String(customerForm.email || "").trim();

    const result = await auth.login(phone, password, "customer");

    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate(redirectPath || "/profile", { replace: true });
  };

  const submitStaff = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const result = await auth.login(staffForm.email, staffForm.password, "staff");
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    navigate(fallbackPathForRole(result.user?.role), { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-6">
      <main className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-emerald-100">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-5 text-white">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25">
              <Lock className="h-7 w-7" />
            </span>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-white/85">ApnaGaon Account</p>
            <h1 className="mt-1 text-2xl font-black">Login, register, or continue as guest</h1>
            <p className="mt-2 text-sm font-semibold text-white/90">Keep your orders, notifications, and saved places connected across the app.</p>
          </div>
            <div className="grid grid-cols-3 gap-2 p-4 text-center">
            <div className="rounded-[20px] bg-emerald-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Orders</p>
            </div>
            <div className="rounded-[20px] bg-orange-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-orange-700">Rewards</p>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-700">Tracking</p>
            </div>
            </div>
            <div className="px-4 pb-4">
              <p className="rounded-[22px] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                {`Login as ${getRoleLabel(auth.user?.role || "customer")}, or open the staff panel for Super Admin, Shop Owner, or Delivery Partner access.`}
              </p>
            </div>
          </section>

        <section className="grid grid-cols-2 gap-2 rounded-[28px] bg-white p-2 shadow-sm ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => setMode("customer")}
            className={`rounded-[22px] px-4 py-3 text-sm font-black transition ${
              mode === "customer" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-50 text-slate-700"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setMode("staff")}
            className={`rounded-[22px] px-4 py-3 text-sm font-black transition ${
              mode === "staff" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-50 text-slate-700"
            }`}
          >
            Staff Access
          </button>
        </section>

        {mode === "customer" ? (
          <form onSubmit={submitCustomer} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mt-4 space-y-3">
              <div className="grid gap-3">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400"><Phone className="h-4 w-4" /> Phone</span>
                  <input
                    value={customerForm.phone}
                    onChange={(event) => updateCustomer("phone", event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="9876543210"
                    inputMode="tel"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-400">Password</span>
                  <input
                    value={customerForm.password}
                    onChange={(event) => updateCustomer("password", event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    placeholder="Your password"
                    type="password"
                  />
                </label>
              </div>
            </div>

            {message ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 transition active:scale-[0.99] disabled:bg-emerald-300"
            >
              {loading ? "Please wait..." : customerView === "register" ? "Create Account" : "Login"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>

            <p className="mt-3 text-center text-xs font-semibold text-slate-500">
              Guest checkout is always available if you want to browse first.
            </p>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="mt-3 w-full rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 ring-1 ring-slate-100"
            >
              New here? Create account
            </button>
          </form>
        ) : (
          <form onSubmit={submitStaff} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Email</span>
              <input
                value={staffForm.email}
                onChange={(event) => updateStaff("email", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                type="email"
                placeholder="admin@apnagaon.local"
              />
            </label>
            <label className="mt-3 grid gap-2 text-sm font-semibold text-slate-700">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Password</span>
              <input
                value={staffForm.password}
                onChange={(event) => updateStaff("password", event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                type="password"
                placeholder="Password"
              />
            </label>

            {message ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
            >
              {loading ? "Signing in..." : "Login"}
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </button>

            <div className="mt-4 grid gap-2">
              {staffAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => setStaffForm({ email: account.email, password: account.password })}
                  className="rounded-2xl bg-slate-50 p-3 text-left text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  {account.role}: {account.email} / {account.password}
                </button>
              ))}
            </div>
          </form>
        )}

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">Keep going</p>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
            >
              Continue as guest
            </button>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
            >
              View order history
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-orders")}
              className="rounded-2xl bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700"
            >
              Open my orders
            </button>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="rounded-2xl bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700"
            >
              Create a new account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
