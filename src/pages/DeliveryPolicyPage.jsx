import React from "react";
import { Truck } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";

const PolicyBlock = ({ title, children }) => (
  <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
    <h2 className="text-base font-black text-slate-950">{title}</h2>
    <div className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-600">{children}</div>
  </section>
);

const DeliveryPolicyPage = () => {
  return (
    <LaunchPageShell
      icon={Truck}
      eyebrow="Delivery promise"
      title="Delivery Policy"
      subtitle="A simple delivery policy helps set expectations before checkout starts."
      highlights={["ETA", "Riders", "Support", "Village delivery"]}
    >
      <PolicyBlock title="How delivery works">
        <p>Orders are assigned based on service area, shop availability, and partner readiness.</p>
        <p>Customers can follow the order lifecycle from placed to delivered, including rider assignment when available.</p>
      </PolicyBlock>

      <PolicyBlock title="Delivery timing">
        <p>Estimated delivery windows depend on distance, stock status, weather, and rider availability.</p>
        <p>When exact timing changes, the app shows a safe fallback estimate instead of a broken state.</p>
      </PolicyBlock>

      <PolicyBlock title="Support during delivery">
        <p>If a delivery is delayed or needs a change, contact support through WhatsApp or call from the tracking page.</p>
        <p>We keep the path simple so customers can always reach a live support option.</p>
      </PolicyBlock>
    </LaunchPageShell>
  );
};

export default DeliveryPolicyPage;
