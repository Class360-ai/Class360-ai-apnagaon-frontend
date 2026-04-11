import React, { useEffect, useMemo, useState } from "react";
import {
  addReward,
  clearAllRewards,
  deleteReward,
  getRewards,
  markUnused,
  markUsed,
  removeExpiredRewards,
  rewardWalletEvents,
} from "../utils/rewardWallet";

const defaultForm = {
  name: "",
  rewardType: "item",
  code: "",
  value: "Free",
  expiryHours: "24",
  rarity: "common",
  applicableOn: "cart,food",
  autoApplicable: true,
  minOrderValue: "0",
};

const AdminRewardPanel = () => {
  const [form, setForm] = useState(defaultForm);
  const [rewards, setRewards] = useState([]);
  const [statusText, setStatusText] = useState("");

  const syncRewards = () => {
    setRewards(getRewards());
  };

  useEffect(() => {
    syncRewards();
    window.addEventListener(rewardWalletEvents.updated, syncRewards);
    return () => window.removeEventListener(rewardWalletEvents.updated, syncRewards);
  }, []);

  const activeCount = useMemo(() => rewards.filter((reward) => !reward.used).length, [rewards]);

  const onAddReward = (event) => {
    event.preventDefault();
    const expiryHours = Number(form.expiryHours) || 24;
    const applicableOn = String(form.applicableOn || "cart")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const created = addReward({
      name: form.name || "Manual Reward",
      rewardType: form.rewardType,
      value: form.value || "Free",
      code: form.code || form.name,
      expiry: Date.now() + expiryHours * 60 * 60 * 1000,
      used: false,
      source: "admin",
      autoApplicable: Boolean(form.autoApplicable),
      applicableOn: applicableOn.length ? applicableOn : ["cart"],
      minOrderValue: Number(form.minOrderValue) || 0,
      rarity: form.rarity,
    });

    if (created) {
      setStatusText("Reward added");
      setForm(defaultForm);
    } else {
      setStatusText("Reward blocked by local anti-abuse rules");
    }
    syncRewards();
  };

  return (
    <section className="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-emerald-100">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Reward Admin Panel</h2>
        <p className="text-xs text-slate-500">Local testing only. Not secure for production admin usage.</p>
      </div>

      <form className="grid gap-3" onSubmit={onAddReward}>
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Reward name"
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.rewardType}
            onChange={(event) => setForm((prev) => ({ ...prev, rewardType: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="item">Item</option>
            <option value="discount">Discount</option>
            <option value="delivery">Delivery</option>
          </select>
          <select
            value={form.rarity}
            onChange={(event) => setForm((prev) => ({ ...prev, rarity: event.target.value }))}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="common">Common</option>
            <option value="rare">Rare</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            placeholder="Code"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.value}
            onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
            placeholder="Value"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.expiryHours}
            onChange={(event) => setForm((prev) => ({ ...prev, expiryHours: event.target.value }))}
            placeholder="Expiry hours"
            type="number"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            value={form.minOrderValue}
            onChange={(event) => setForm((prev) => ({ ...prev, minOrderValue: event.target.value }))}
            placeholder="Min order value"
            type="number"
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <input
          value={form.applicableOn}
          onChange={(event) => setForm((prev) => ({ ...prev, applicableOn: event.target.value }))}
          placeholder="Applicable on (comma separated)"
          className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.autoApplicable}
            onChange={(event) => setForm((prev) => ({ ...prev, autoApplicable: event.target.checked }))}
          />
          Auto applicable
        </label>
        <button type="submit" className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
          Add Reward
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            removeExpiredRewards();
            syncRewards();
          }}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          Clear Expired
        </button>
        <button
          type="button"
          onClick={() => {
            clearAllRewards();
            syncRewards();
          }}
          className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white"
        >
          Clear All
        </button>
      </div>

      {statusText ? <p className="mt-2 text-xs text-emerald-700">{statusText}</p> : null}
      <p className="mt-2 text-xs text-slate-500">Total: {rewards.length} | Active: {activeCount}</p>

      <div className="mt-3 grid gap-2">
        {rewards.length === 0 ? <p className="text-sm text-slate-500">No rewards yet</p> : null}
        {rewards.map((reward) => (
          <article key={reward.id} className="rounded-2xl border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-slate-900">{reward.name}</strong>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                {reward.used ? "Used" : "Active"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {reward.rewardType} | {reward.code} | source: {reward.source}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  markUsed(reward.id);
                  syncRewards();
                }}
                className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-semibold text-white"
              >
                Mark Used
              </button>
              <button
                type="button"
                onClick={() => {
                  markUnused(reward.id);
                  syncRewards();
                }}
                className="rounded-lg bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-800"
              >
                Mark Unused
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteReward(reward.id);
                  syncRewards();
                }}
                className="rounded-lg bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminRewardPanel;
