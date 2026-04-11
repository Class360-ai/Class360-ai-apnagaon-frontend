import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Store, ShieldCheck } from "lucide-react";
import ShopApplicationForm from "../components/ShopApplicationForm";
import { partnersAPI, safeFetch } from "../utils/api";
import { upsertShopApplication } from "../utils/shopApplicationStorage";

const ShopJoinPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [application, setApplication] = useState(null);

  const handleSubmit = async (formData) => {
    setMessage("");
    const payload = {
      ...formData,
      status: "pending",
      source: "shop-join",
      createdAt: new Date().toISOString(),
    };

    const backendSaved = await safeFetch(() => partnersAPI.apply(payload), null);
    const saved = backendSaved || payload;
    const normalized = upsertShopApplication(saved);
    setApplication(normalized[0] || saved);
    setMessage("Your shop application has been submitted. Pending review.");
  };

  const trustCards = useMemo(
    () => [
      { icon: Store, title: "Local shop owners", text: "Built for village kirana, dairy, and service shops." },
      { icon: ShieldCheck, title: "Safe review", text: "Admin approval keeps the marketplace clean and trusted." },
      { icon: BadgeCheck, title: "Fast setup", text: "Submit today and track your application from your phone." },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-5">
      <main className="mx-auto max-w-3xl space-y-4">
        <section className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-emerald-100">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-orange-500 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Partner onboarding</p>
            <h1 className="mt-2 text-3xl font-black">Join ApnaGaon as a shop</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold text-white/90">
              A simple, mobile-friendly application for local shop owners to get listed on ApnaGaon.
            </p>
          </div>

          <div className="grid gap-3 p-4 md:grid-cols-3">
            {trustCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                  <Icon className="h-6 w-6 text-emerald-600" />
                  <p className="mt-3 text-sm font-black text-slate-950">{card.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{card.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Application form</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Tell us about your shop</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Use your phone to fill the details. Placeholders are okay for photos and proof links.</p>
          </div>

          <ShopApplicationForm
            submitLabel="Submit Application"
            onSubmit={handleSubmit}
          />

          {message ? (
            <div className="mt-4 rounded-[24px] bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
              {message}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/partner/status")}
              className="rounded-full bg-emerald-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-emerald-100"
            >
              Check application status
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-full bg-white px-4 py-4 text-sm font-black text-slate-900 ring-1 ring-slate-100"
            >
              Back to home
            </button>
          </div>
        </section>

        {application ? (
          <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Latest submission</p>
            <h3 className="mt-1 text-lg font-black text-slate-950">{application.shopName}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Status: <span className="font-black text-amber-600">Pending review</span>
            </p>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default ShopJoinPage;
