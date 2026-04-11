import React from "react";
import { useNavigate } from "react-router-dom";
import { CircleHelp, CreditCard, MessageCircle, Package, Store, Truck } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";
import SupportActions from "../components/SupportActions";
import { getWhatsAppLink } from "../utils/whatsappUtils";

const ISSUE_CATEGORIES = [
  {
    label: "Order issue",
    icon: Package,
    message: "Hello ApnaGaon, I need help with an order issue.",
  },
  {
    label: "Payment issue",
    icon: CreditCard,
    message: "Hello ApnaGaon, I need help with a payment issue.",
  },
  {
    label: "Delivery issue",
    icon: Truck,
    message: "Hello ApnaGaon, I need help with a delivery issue.",
  },
  {
    label: "Shop partner help",
    icon: Store,
    message: "Hello ApnaGaon, I need help with shop partner onboarding.",
  },
];

const HelpPage = () => {
  const navigate = useNavigate();

  const openIssue = (message) => {
    const link = getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <LaunchPageShell
      icon={CircleHelp}
      eyebrow="Need a hand?"
      title="Help & Support"
      subtitle="Choose the issue that fits, and we’ll point you to the fastest support path."
      highlights={["WhatsApp support", "Call support", "FAQ", "Launch ready"]}
    >
      <SupportActions message="Hello ApnaGaon, I need help with my order." />

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-base font-black text-slate-950">Issue categories</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">Tap a topic to open a ready-to-send WhatsApp message.</p>
        <div className="mt-3 grid gap-2">
          {ISSUE_CATEGORIES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => openIssue(item.message)}
                className="flex items-center justify-between gap-3 rounded-[20px] bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100 transition hover:bg-slate-100"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-slate-950">{item.label}</span>
                    <span className="block text-[11px] font-medium text-slate-500">Open support in WhatsApp</span>
                  </span>
                </span>
                <MessageCircle className="h-4 w-4 text-emerald-600" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] bg-gradient-to-br from-emerald-50 to-orange-50 p-4 ring-1 ring-emerald-100">
        <h2 className="text-base font-black text-slate-950">Quick tips</h2>
        <ul className="mt-3 space-y-2 text-xs font-medium leading-5 text-slate-600">
          <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">If an order is stuck, open tracking and share the order ID with support.</li>
          <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">For payment failures, try again or switch to Cash on Delivery.</li>
          <li className="rounded-[18px] bg-white px-3 py-3 shadow-sm ring-1 ring-emerald-50">Shop owners can apply directly from the partner onboarding page.</li>
        </ul>
      </section>

      <button
        type="button"
        onClick={() => navigate("/faq")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200"
      >
        View FAQs
      </button>
    </LaunchPageShell>
  );
};

export default HelpPage;
