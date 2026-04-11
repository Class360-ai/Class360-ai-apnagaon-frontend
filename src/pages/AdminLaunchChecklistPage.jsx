import React, { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Copy, RefreshCcw, Store, Truck, Wallet, Bell, Package, AlertCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { launchSeedData, launchLaunchChecklistItems } from "../data/launchSeedData";
import { getLaunchChecklistProgress, getLaunchChecklistState, resetLaunchChecklist, toggleLaunchChecklistItem } from "../utils/launchChecklistStorage";
import { getProductionApiFallback } from "../utils/runtimeConfig";

const CHECKLIST_SECTIONS = [
  {
    title: "Deployment",
    items: [
      { key: "frontend-deployed", label: "Frontend deployed", hint: "Vite build published to your hosting provider." },
      { key: "backend-deployed", label: "Backend deployed", hint: "Node/Express API live and reachable." },
      { key: "database-connected", label: "Database connected", hint: "MongoDB is wired up and responding." },
      { key: "domain-connected", label: "Domain connected", hint: "Custom domain and SSL are active." },
      { key: "env-configured", label: "Env variables configured", hint: "API URL, WhatsApp, support, and secrets are set." },
    ],
  },
  {
    title: "Launch readiness",
    items: [
      { key: "products-ready", label: "Products ready", hint: "Seeded groceries and essentials are in place." },
      { key: "shops-ready", label: "Shops ready", hint: "At least 3 local shops can receive orders." },
      { key: "delivery-ready", label: "Delivery partners ready", hint: "Riders can accept assigned orders." },
      { key: "payments-ready", label: "Payments ready", hint: "UPI and COD are verified." },
      { key: "support-ready", label: "Support ready", hint: "WhatsApp and call support numbers are configured." },
      { key: "notifications-ready", label: "Notifications ready", hint: "Order and delivery alerts are sending." },
      { key: "legal-ready", label: "Legal pages ready", hint: "Privacy, terms, refunds, and delivery policy exist." },
    ],
  },
];

const FLOW_STEPS = [
  "Signup/login",
  "Add address",
  "Add to cart",
  "Checkout",
  "Payment / WhatsApp order",
  "Order success",
  "Order tracking",
  "Admin order receive",
  "Assign delivery partner",
  "Delivery update",
  "Notifications",
];

const seedSummary = [
  { label: "Products", value: launchSeedData.products.length, icon: Package, tone: "emerald" },
  { label: "Categories", value: launchSeedData.categories.length, icon: ClipboardCheck, tone: "blue" },
  { label: "Shops", value: launchSeedData.shops.length, icon: Store, tone: "orange" },
  { label: "Riders", value: launchSeedData.deliveryPartners.length, icon: Truck, tone: "slate" },
  { label: "Offers", value: launchSeedData.offers.length, icon: Wallet, tone: "emerald" },
  { label: "Rewards", value: launchSeedData.rewards.length, icon: Bell, tone: "orange" },
];

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  slate: "bg-slate-50 text-slate-700 ring-slate-100",
};

const AdminLaunchChecklistPage = () => {
  const [checklist, setChecklist] = useState(() => getLaunchChecklistState());

  const progress = useMemo(() => getLaunchChecklistProgress(checklist), [checklist]);
  const config = useMemo(() => getProductionApiFallback(), []);

  const handleToggle = (key) => {
    const next = toggleLaunchChecklistItem(key);
    setChecklist(next);
  };

  const handleReset = () => {
    const next = resetLaunchChecklist();
    setChecklist(next);
  };

  const handleMarkAll = () => {
    const next = { ...checklist };
    launchLaunchChecklistItems.forEach((key) => {
      next[key] = true;
    });
    window.localStorage.setItem("apnagaon_launch_checklist_v1", JSON.stringify(next));
    setChecklist(next);
  };

  const copyLaunchNotes = async () => {
    const notes = [
      `API: ${config.apiBaseUrl}`,
      `Support phone: ${config.supportPhone}`,
      `WhatsApp: ${config.whatsappNumber}`,
      `Delivery ETA: ${config.deliveryEtaMinutes} min default`,
      `Free delivery threshold: ₹${config.freeDeliveryThreshold}`,
      `Seed packs: ${seedSummary.map((item) => `${item.label}=${item.value}`).join(", ")}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(notes);
    } catch (error) {
      console.error("Unable to copy launch notes:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Live launch</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">Launch Checklist</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Mark everything ready locally, then hand off the app for the first real customers.</p>
            </div>
            <div className="rounded-[22px] bg-emerald-50 px-4 py-3 text-right ring-1 ring-emerald-100">
              <p className="text-[11px] font-black uppercase tracking-wide text-emerald-700">Progress</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{progress.percent}%</p>
              <p className="text-xs font-semibold text-slate-500">{progress.completed}/{progress.total} complete</p>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-orange-500" style={{ width: `${progress.percent}%` }} />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {seedSummary.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">{card.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{card.value}</p>
                  </div>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${toneClasses[card.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Checklist count</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{progress.completed}/{progress.total}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Launch items completed locally</p>
          </div>
          <div className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Soft launch readiness</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{progress.percent}%</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Good enough to start a controlled rollout</p>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Production notes</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Where to configure launch settings</h2>
            </div>
            <button
              type="button"
              onClick={copyLaunchNotes}
              className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-100"
            >
              <Copy className="h-4 w-4" />
              Copy notes
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              `Frontend API: ${config.apiBaseUrl}`,
              `Support phone: ${config.supportPhone}`,
              `WhatsApp number: ${config.whatsappNumber}`,
              `Default ETA: ${config.deliveryEtaMinutes} minutes`,
              `Free delivery threshold: ₹${config.freeDeliveryThreshold}`,
            ].map((item) => (
              <div key={item} className="rounded-[20px] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-100">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Soft launch flow</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Test the first real usage path</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
              11 steps
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {FLOW_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-[20px] bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-2xl bg-white text-sm font-black text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">Checklist</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Mark launch items complete</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMarkAll}
                className="rounded-full bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100"
              >
                Mark all
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-700 ring-1 ring-slate-100"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {CHECKLIST_SECTIONS.map((section) => (
              <div key={section.title} className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">{section.title}</h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {section.items.filter((item) => checklist[item.key]).length}/{section.items.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {section.items.map((item) => {
                    const checked = Boolean(checklist[item.key]);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleToggle(item.key)}
                        className={`flex w-full items-start gap-3 rounded-[20px] px-4 py-3 text-left ring-1 transition ${
                          checked ? "bg-white ring-emerald-100" : "bg-white/80 ring-slate-100"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ring-1 ${checked ? "bg-emerald-600 ring-emerald-100 text-white" : "bg-slate-100 ring-slate-200 text-slate-300"}`}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-slate-950">{item.label}</span>
                          <span className="block text-xs font-medium leading-5 text-slate-500">{item.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-orange-50 p-4 ring-1 ring-emerald-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-emerald-700" />
            <h2 className="text-base font-black text-slate-950">First 10 shop onboarding plan</h2>
          </div>
          <ol className="mt-3 space-y-2 text-sm font-medium leading-6 text-slate-600">
            <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">1. Shortlist 10 shops from the 3 nearby market areas.</li>
            <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">2. Collect phone numbers, WhatsApp numbers, and opening hours.</li>
            <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">3. Fill the shop join form and keep proof images ready.</li>
            <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">4. Approve the first 3 shops manually before opening orders to the public.</li>
            <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">5. Test 20 sample orders before moving to full public launch.</li>
          </ol>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminLaunchChecklistPage;
