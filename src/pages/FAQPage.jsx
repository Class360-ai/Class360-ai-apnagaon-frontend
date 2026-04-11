import React, { useState } from "react";
import { ChevronDown, ChevronUp, CircleHelp } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";
import SupportActions from "../components/SupportActions";

const FAQS = [
  {
    question: "How do I place an order?",
    answer: "Open a product or service, add it to cart, then continue through address, summary, and payment.",
  },
  {
    question: "Can I pay Cash on Delivery?",
    answer: "Yes. COD is available for supported orders and shows clearly during checkout.",
  },
  {
    question: "What if my order is delayed?",
    answer: "Open tracking to see the latest status. If it still looks stuck, contact support on WhatsApp.",
  },
  {
    question: "How do I change my saved address?",
    answer: "Go to checkout address step or open Profile to review your saved places.",
  },
  {
    question: "How can shop owners join ApnaGaon?",
    answer: "Use the partner onboarding page to submit a shop application for admin review.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <LaunchPageShell
      icon={CircleHelp}
      eyebrow="Common questions"
      title="FAQ"
      subtitle="The questions we expect most often, answered in a simple and friendly way."
      highlights={["Orders", "Payments", "Tracking", "Partners"]}
    >
      <SupportActions message="Hello ApnaGaon, I have a question about the FAQ page." compact />

      <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="space-y-2">
          {FAQS.map((item, index) => {
            const isOpen = index === openIndex;
            return (
              <button
                key={item.question}
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full rounded-[20px] bg-slate-50 p-4 text-left ring-1 ring-slate-100 transition hover:bg-slate-100"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-slate-950">{item.question}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-700" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
                {isOpen ? <p className="mt-3 text-xs font-medium leading-6 text-slate-500">{item.answer}</p> : null}
              </button>
            );
          })}
        </div>
      </section>
    </LaunchPageShell>
  );
};

export default FAQPage;
