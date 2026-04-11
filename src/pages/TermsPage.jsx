import React from "react";
import { FileText } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";

const PolicyBlock = ({ title, children }) => (
  <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
    <h2 className="text-base font-black text-slate-950">{title}</h2>
    <div className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-600">{children}</div>
  </section>
);

const TermsPage = () => {
  return (
    <LaunchPageShell
      icon={FileText}
      eyebrow="Terms of use"
      title="Terms & Conditions"
      subtitle="Simple launch-ready terms for customers, partners, and support teams."
      highlights={["Usage", "Payments", "Support", "Partners"]}
    >
      <PolicyBlock title="Using ApnaGaon">
        <p>ApnaGaon is built to help local users discover products, services, and delivery support in a village-first way.</p>
        <p>By using the app, you agree to place accurate order details and keep your account information current.</p>
      </PolicyBlock>

      <PolicyBlock title="Orders and support">
        <p>Orders may be confirmed, prepared, delivered, or cancelled based on availability and delivery conditions.</p>
        <p>Support may use WhatsApp or call assistance to help with issues, order changes, or delivery follow-up.</p>
      </PolicyBlock>

      <PolicyBlock title="Payments">
        <p>Payments can be made using UPI or Cash on Delivery where available. Failure states are handled safely and can be retried.</p>
        <p>Any future gateway integration will follow the same order and payment linking rules already used in the app.</p>
      </PolicyBlock>
    </LaunchPageShell>
  );
};

export default TermsPage;
