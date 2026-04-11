import React, { useMemo, useState } from "react";
import { Search, Store, Phone, Clock3, MapPin } from "lucide-react";
import ShopStatusBadge from "../components/ShopStatusBadge";
import { partnersAPI, safeFetch } from "../utils/api";
import { findShopApplicationByPhone, normalizeShopApplication } from "../utils/shopApplicationStorage";

const ShopStatusPage = () => {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (event) => {
    event.preventDefault();
    const normalizedPhone = String(phone || "").trim();
    if (!normalizedPhone) {
      setMessage("Enter your phone number to check the status.");
      return;
    }

    setLoading(true);
    setMessage("");
    const backend = await safeFetch(() => partnersAPI.statusByPhone(normalizedPhone), null);
    const local = backend || findShopApplicationByPhone(normalizedPhone);
    const normalized = local ? normalizeShopApplication(local) : null;
    setResult(normalized);
    setMessage(normalized ? "" : "No application found for this phone number.");
    setLoading(false);
  };

  const statusCopy = useMemo(() => {
    if (!result) return null;
    const text = String(result.status || "pending").toLowerCase();
    if (text === "approved") return "Your shop is approved and can be activated on the platform.";
    if (text === "rejected") return "This application was not approved. Please review the admin note and try again.";
    if (text === "suspended") return "This application is currently on hold.";
    return "Your application is under review. We will update you soon.";
  }, [result]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-5">
      <main className="mx-auto max-w-xl space-y-4">
        <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Store className="h-7 w-7" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Application status</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">Check your shop request</h1>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            Enter the phone number used in the application. We will show the latest status from backend or safe local storage.
          </p>

          <form onSubmit={lookup} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-full bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 outline-none placeholder:text-slate-400"
                placeholder="Phone number"
                inputMode="tel"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </form>

          {message ? (
            <div className="mt-4 rounded-[24px] bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
              {message}
            </div>
          ) : null}
        </section>

        {result ? (
          <section className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Shop application</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">{result.shopName}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{result.ownerName || "Owner not added"}</p>
              </div>
              <ShopStatusBadge status={result.status} />
            </div>

            <p className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
              {statusCopy}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Village / Area</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{result.area || "Not provided"}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Category</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{result.category || "grocery"}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                  <Phone className="h-4 w-4" />
                  Contact
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">{result.phone || "Not provided"}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400">
                  <Clock3 className="h-4 w-4" />
                  Submitted
                </p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : "Today"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Address</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-emerald-900">{[result.address, result.city, result.state, result.pincode].filter(Boolean).join(", ")}</p>
            </div>

            {result.reviewNote ? (
              <div className="mt-4 rounded-[24px] bg-slate-50 p-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
                Admin note: {result.reviewNote}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-black text-slate-950">Need help?</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">If your application is pending, the admin team can review it from their dashboard.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ShopStatusPage;
