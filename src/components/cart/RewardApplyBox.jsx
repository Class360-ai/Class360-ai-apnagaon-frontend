import React from "react";
import { Gift, Sparkles } from "lucide-react";

const RewardApplyBox = ({ rewards = [], selectedRewardId, summary, onSelectReward, onClearReward, onApplyBestReward }) => {
  if (!Array.isArray(rewards) || rewards.length === 0) return null;

  const selectedReward = rewards.find((reward) => reward.id === selectedRewardId) || null;

  return (
    <section className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-emerald-100">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Gift className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-950">Applied Reward</p>
            <p className="text-xs font-semibold text-slate-500">{selectedReward ? selectedReward.name : "Choose from available rewards"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onApplyBestReward}
          className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"
        >
          Apply best
        </button>
      </div>

      <p className="mb-2 flex items-center gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Available Rewards</span>
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {rewards.map((reward) => {
          const active = selectedRewardId === reward.id;
          return (
            <button
              key={reward.id}
              type="button"
              onClick={() => onSelectReward(reward.id)}
              className={`min-w-max rounded-full border px-3 py-2 text-xs font-black transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}
            >
              {reward.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onClearReward}
          className="min-w-max rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500"
        >
          Remove
        </button>
      </div>

      {summary?.notes?.length ? <p className="mt-3 text-xs font-semibold text-emerald-700">{summary.notes[0]}</p> : null}
    </section>
  );
};

export default RewardApplyBox;
