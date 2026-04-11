import React from "react";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";
import SupportActions from "../components/SupportActions";

const CONTACT_ITEMS = [
  {
    label: "WhatsApp",
    value: "+91 918004710164",
    icon: MessageCircle,
    description: "Fastest for support and order help",
  },
  {
    label: "Call support",
    value: "+91 9876543210",
    icon: Phone,
    description: "Best for urgent delivery or payment issues",
  },
  {
    label: "Email",
    value: "help@apnagaon.in",
    icon: Mail,
    description: "For detailed feedback or partnership queries",
  },
  {
    label: "Service area",
    value: "Village-first delivery network",
    icon: Globe,
    description: "Support grows with your local area",
  },
];

const ContactPage = () => {
  return (
    <LaunchPageShell
      icon={MapPin}
      eyebrow="Reach us"
      title="Contact"
      subtitle="A simple contact page for customers, shop owners, and delivery partners."
      highlights={["WhatsApp", "Call", "Email", "Local support"]}
    >
      <SupportActions message="Hello ApnaGaon, I would like support from the contact page." />

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h2 className="text-base font-black text-slate-950">Contact details</h2>
        <div className="mt-3 space-y-2">
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3 rounded-[20px] bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-950">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{item.value}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] bg-gradient-to-br from-emerald-50 to-orange-50 p-4 ring-1 ring-emerald-100">
        <h2 className="text-base font-black text-slate-950">Working hours</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
          Everyday support: 9:00 AM to 9:00 PM. Orders can still be placed anytime, and we’ll respond as soon as support is available.
        </p>
      </section>
    </LaunchPageShell>
  );
};

export default ContactPage;
