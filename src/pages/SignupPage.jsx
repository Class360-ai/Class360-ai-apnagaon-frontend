import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Phone, User } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { getRoleHomePath } from "../utils/roleUtils";

const initialForm = {
  name: "",
  phone: "",
  password: "",
  village: "",
  address: "",
  email: "",
};

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500";

const SignupPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = useMemo(() => location.state?.from || getRoleHomePath(auth.user?.role || "customer"), [auth.user?.role, location.state?.from]);

  useEffect(() => {
    if (auth.isLoggedIn) {
      navigate(redirectPath, { replace: true });
    }
  }, [auth.isLoggedIn, navigate, redirectPath]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const errors = [];
    if (!String(form.name || "").trim()) errors.push("Name is required.");
    if (!String(form.phone || "").trim()) errors.push("Phone number is required.");
    if (!String(form.password || "").trim()) errors.push("Password is required.");
    return errors;
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    const errors = validate();
    if (errors.length) {
      setMessage(errors[0]);
      return;
    }

    setLoading(true);
    const result = await auth.signup({
      name: String(form.name || "").trim(),
      phone: String(form.phone || "").trim(),
      password: String(form.password || "").trim(),
      village: String(form.village || "").trim(),
      address: String(form.address || "").trim(),
      email: String(form.email || "").trim() || `guest_${String(form.phone || "").replace(/\D/g, "") || Date.now()}@apnagaon.local`,
    });
    setLoading(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate(redirectPath || "/profile", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-24 pt-6">
      <main className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-emerald-100">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-5 text-white">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Lock className="h-7 w-7" />
            </span>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-white/85">Create account</p>
            <h1 className="mt-1 text-2xl font-black">Join ApnaGaon</h1>
            <p className="mt-2 text-sm font-semibold text-white/90">Save addresses, track orders, and keep your rewards in one place.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 p-4 text-center">
            <div className="rounded-[20px] bg-emerald-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Quick</p>
            </div>
            <div className="rounded-[20px] bg-orange-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-orange-700">Secure</p>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-700">Ready</p>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="space-y-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                <User className="h-4 w-4" />
                Name
              </span>
              <input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className={fieldClass}
                placeholder="Your full name"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                <Phone className="h-4 w-4" />
                Phone
              </span>
              <input
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                className={fieldClass}
                placeholder="9876543210"
                inputMode="tel"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Password</span>
              <div className="relative">
                <input
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  className={`${fieldClass} pr-12`}
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Village or area optional</span>
              <input
                value={form.village}
                onChange={(event) => update("village", event.target.value)}
                className={fieldClass}
                placeholder="Azampur"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Address optional</span>
              <textarea
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                className={`${fieldClass} min-h-[96px] resize-none`}
                placeholder="House number, landmark, street"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              <span className="text-xs font-black uppercase tracking-wide text-slate-400">Email optional</span>
              <input
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                className={fieldClass}
                placeholder="you@example.com"
                type="email"
              />
            </label>
          </div>

          {message ? <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
          >
            {loading ? "Creating..." : "Create account"}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-3 w-full rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 ring-1 ring-slate-100"
          >
            Already have an account? Login
          </button>
        </form>
      </main>
    </div>
  );
};

export default SignupPage;
