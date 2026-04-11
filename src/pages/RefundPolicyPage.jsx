import React from "react";
import { Wallet } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";

const PolicyBlock = ({ title, children }) => (
  <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
    <h2 className="text-base font-black text-slate-950">{title}</h2>
    <div className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-600">{children}</div>
  </section>
);

const RefundPolicyPage = () => {
  return (
    <LaunchPageShell
      icon={Wallet}
      eyebrow="Refunds and returns"
      title="Refund Policy"
      subtitle="Clear refund flow language helps customers trust checkout on day one."
      highlights={["Cancellations", "Failed orders", "Refunds", "COD"]}
    >
      <PolicyBlock title="When refunds apply">
        <p>Refunds may apply when an order is cancelled before preparation, payment fails after authorization, or a service cannot be fulfilled.</p>
        <p>We keep refund handling safe and predictable so customers never feel stuck with a broken flow.</p>
      </PolicyBlock>

      <PolicyBlock title="How refund status appears">
        <p>Refund-related status updates can appear in order tracking, order confirmation, and admin dashboards.</p>
        <p>If a refund is pending, the app will continue to show the latest known state without crashing.</p>
      </PolicyBlock>

      <PolicyBlock title="Need help">
        <p>Open Help or Contact to raise a refund request with the order ID and a short explanation. That keeps support fast and organized.</p>
      </PolicyBlock>
    </LaunchPageShell>
  );
};

export default RefundPolicyPage;
