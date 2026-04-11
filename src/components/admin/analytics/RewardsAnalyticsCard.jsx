import React from "react";
import { Gift, Ticket, Sparkles } from "lucide-react";
import { formatPrice } from "../../../utils/helpers";

const StatPill = ({ label, value, tone = "emerald" }) => {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    orange: "bg-orange-50 text-orange-700 ring-orange-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };
  return (
    <div className={`rounded-[22px] p-3 ring-1 ${toneClasses[tone] || toneClasses.emerald}`}>
      <p className="text-[10px] font-black uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
};

const RewardsAnalyticsCard = ({ rewardStats = {}, topRewards = [] }) => (
  <section className="rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Rewards & offers</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Reward analytics</h2>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700 ring-1 ring-orange-100">
        <Gift className="h-5 w-5" />
      </span>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatPill label="Total spins" value={rewardStats.totalSpins || 0} tone="emerald" />
      <StatPill label="Rewards won" value={rewardStats.rewardsWon || 0} tone="blue" />
      <StatPill label="Rewards used" value={rewardStats.rewardsUsed || 0} tone="orange" />
      <StatPill label="Coupon usage" value={rewardStats.couponUsage || 0} tone="slate" />
    </div>

    <div className="mt-4 grid gap-3 xl:grid-cols-2">
      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Popular reward</p>
        {rewardStats.popularReward ? (
          <div className="mt-2">
            <p className="text-base font-black text-slate-950">{rewardStats.popularReward.name}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {rewardStats.popularReward.count} uses · {rewardStats.popularReward.type}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm font-semibold text-slate-500">No reward usage yet.</p>
        )}
      </div>

      <div className="rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-100">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Offer conversion</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-2xl font-black text-slate-950">{Math.round((rewardStats.offerConversion || 0) * 100)}%</p>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600 ring-1 ring-slate-100">
            {formatPrice((rewardStats.rewardsUsed || 0) * 10)} saved proxy
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-500">Proxy based on coupon and reward usage against total orders.</p>
      </div>
    </div>

    <div className="mt-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">Top rewards / coupons</p>
      <div className="mt-3 grid gap-2">
        {topRewards.length ? (
          topRewards.map((reward) => (
            <div key={reward.name} className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{reward.name}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{reward.type || "reward"} · {reward.count} uses</p>
                </div>
                <Ticket className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No coupon analytics yet.</div>
        )}
      </div>
    </div>

    <div className="mt-4 rounded-[24px] bg-emerald-50 p-4 ring-1 ring-emerald-100">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 text-emerald-700" />
        <div>
          <p className="text-sm font-black text-emerald-950">Business note</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
            Reward and coupon performance is derived from the order table and local reward wallet when backend reward tracking is not present yet.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default RewardsAnalyticsCard;
