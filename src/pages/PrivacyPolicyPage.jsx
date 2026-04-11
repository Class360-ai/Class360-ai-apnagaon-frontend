import React from "react";
import { ShieldCheck } from "lucide-react";
import LaunchPageShell from "../components/LaunchPageShell";

const PolicyBlock = ({ title, children }) => (
  <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-gray-100">
    <h2 className="text-base font-black text-slate-950">{title}</h2>
    <div className="mt-2 space-y-2 text-sm font-medium leading-6 text-slate-600">{children}</div>
  </section>
);

const PrivacyPolicyPage = () => {
  return (
    <LaunchPageShell
      icon={ShieldCheck}
      eyebrow="Trust and safety"
      title="Privacy Policy"
      subtitle="We keep this clear and readable so the launch version feels trustworthy."
      highlights={["Customer data", "Addresses", "Orders", "Support"]}
    >
      <PolicyBlock title="What we collect">
        <p>We collect the details needed to place orders, deliver them, support customers, and keep accounts working smoothly.</p>
        <p>That includes name, phone number, saved addresses, order history, and support messages you choose to send.</p>
      </PolicyBlock>

      <PolicyBlock title="How we use it">
        <p>We use your information to process orders, show tracking updates, improve delivery reliability, and personalize the app experience.</p>
        <p>We also use it to send helpful notifications about order status, rewards, and support updates.</p>
      </PolicyBlock>

      <PolicyBlock title="Your control">
        <p>You can review account settings, update your profile, and manage addresses whenever needed.</p>
        <p>If backend storage is not available, we keep safe local fallbacks so the app still works without losing your session flow.</p>
      </PolicyBlock>

      <PolicyBlock title="Contact">
        <p>For privacy questions, open the Help or Contact pages. We’ll keep the support path simple and easy to reach.</p>
      </PolicyBlock>
    </LaunchPageShell>
  );
};

export default PrivacyPolicyPage;
