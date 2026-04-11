const REWARD_WALLET_KEY = "apnagaon_reward_wallet_v1";
const REWARD_WALLET_UPDATED = "apnagaon:reward-wallet-updated";
const REWARD_TTL_MS = 24 * 60 * 60 * 1000;
const REWARD_ADD_WINDOW_MS = 60 * 1000;
const MAX_ACTIVE_REWARDS = 3;

const hasWindow = () => typeof window !== "undefined" && Boolean(window.localStorage);

const nowTs = () => Date.now();

const safeParse = (raw) => {
  if (!raw || typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const safeSave = (rewards) => {
  if (!hasWindow()) return false;
  try {
    const payload = JSON.stringify(Array.isArray(rewards) ? rewards : []);
    window.localStorage.setItem(REWARD_WALLET_KEY, payload);
    window.dispatchEvent(new CustomEvent(REWARD_WALLET_UPDATED));
    return true;
  } catch (error) {
    return false;
  }
};

const normalizeCode = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const inferRarity = (reward = {}) => {
  const safeName = String(reward.name || "").toLowerCase();
  const safeCode = String(reward.code || "").toUpperCase();
  if (reward.rarity === "rare") return "rare";
  if (safeName.includes("free milk") || safeName.includes("coupon") || safeCode.includes("MILK") || safeCode.includes("50")) {
    return "rare";
  }
  return "common";
};

const normalizeReward = (reward = {}) => {
  const createdAt = Number.isFinite(reward.createdAt) ? reward.createdAt : nowTs();
  const rewardType = reward.rewardType || reward.type || "item";
  const safeName = String(reward.name || "Reward").trim() || "Reward";
  const code = normalizeCode(reward.code || safeName || `REWARD_${createdAt}`);
  const expiry = Number.isFinite(reward.expiry) ? reward.expiry : createdAt + REWARD_TTL_MS;
  const minOrderValue = Number.isFinite(reward.minOrderValue) ? reward.minOrderValue : 0;
  const applicableOn = Array.isArray(reward.applicableOn) && reward.applicableOn.length > 0 ? reward.applicableOn : ["cart"];

  return {
    id: reward.id || `reward_${createdAt}_${Math.floor(Math.random() * 10000)}`,
    name: safeName,
    rewardType,
    value: reward.value || "Free",
    code: code || `REWARD_${createdAt}`,
    expiry,
    used: Boolean(reward.used),
    usedAt: Number.isFinite(reward.usedAt) ? reward.usedAt : null,
    createdAt,
    source: reward.source || "manual",
    autoApplicable: reward.autoApplicable !== false,
    applicableOn,
    minOrderValue,
    rarity: reward.rarity || inferRarity(reward),
    discountType: reward.discountType || null,
    discountValue: Number.isFinite(reward.discountValue) ? reward.discountValue : null,
    freeItemName: reward.freeItemName || null,
  };
};

const readWallet = () => {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(REWARD_WALLET_KEY);
    return safeParse(raw).map((item) => normalizeReward(item));
  } catch (error) {
    return [];
  }
};

const isExpired = (reward, now = nowTs()) => !Number.isFinite(reward?.expiry) || reward.expiry <= now;

const isActive = (reward, now = nowTs()) => !reward?.used && !isExpired(reward, now);

export const isRareReward = (reward) => normalizeReward(reward).rarity === "rare";

// Frontend-only anti-abuse guardrails. Real validation must move to backend in production.
export const canAddReward = (newReward, existingRewards = []) => {
  const now = nowTs();
  const reward = normalizeReward(newReward);
  const activeRewards = existingRewards.filter((item) => isActive(item, now));

  if (activeRewards.length >= MAX_ACTIVE_REWARDS) {
    return { allowed: false, reason: "max_active_limit" };
  }

  const duplicateCode = activeRewards.find((item) => item.code === reward.code);
  if (duplicateCode) {
    return { allowed: false, reason: "duplicate_code_active" };
  }

  const recentDuplicate = existingRewards.find(
    (item) => item.code === reward.code && now - (item.createdAt || 0) < REWARD_ADD_WINDOW_MS
  );
  if (recentDuplicate) {
    return { allowed: false, reason: "duplicate_too_soon" };
  }

  if (isRareReward(reward)) {
    const hasRareActive = activeRewards.some((item) => isRareReward(item));
    if (hasRareActive) {
      return { allowed: false, reason: "rare_already_active" };
    }
  }

  return { allowed: true, reason: null };
};

export const removeExpiredRewards = () => {
  const existing = readWallet();
  const now = nowTs();
  const cleaned = existing.filter((reward) => !isExpired(reward, now));
  if (cleaned.length !== existing.length) {
    safeSave(cleaned);
  }
  return cleaned;
};

export const getRewards = () => removeExpiredRewards();

export const getRewardById = (id) => {
  if (!id) return null;
  return getRewards().find((reward) => reward.id === id) || null;
};

export const getActiveRewards = () => getRewards().filter((reward) => isActive(reward));

export const getApplicableRewards = (context = {}) => {
  const safeContext = typeof context === "string" ? { area: context } : context || {};
  const area = safeContext.area || safeContext.context || "cart";
  const subtotal = Number.isFinite(safeContext.subtotal) ? safeContext.subtotal : 0;

  return getActiveRewards().filter((reward) => {
    const scope = Array.isArray(reward.applicableOn) && reward.applicableOn.length > 0 ? reward.applicableOn : ["cart"];
    const allowedArea = scope.includes(area) || scope.includes("all");
    const minOk = subtotal >= (reward.minOrderValue || 0);
    return allowedArea && minOk;
  });
};

export const addReward = (reward) => {
  const existing = getRewards();
  const normalized = normalizeReward(reward);
  const check = canAddReward(normalized, existing);
  if (!check.allowed) {
    return null;
  }
  const next = [normalized, ...existing];
  safeSave(next);
  return normalized;
};

export const markUsed = (id) => {
  if (!id) return false;
  const existing = getRewards();
  let updated = false;
  const next = existing.map((reward) => {
    if (reward.id !== id) return reward;
    if (reward.used) return reward;
    updated = true;
    return { ...reward, used: true, usedAt: nowTs() };
  });
  if (updated) safeSave(next);
  return updated;
};

export const markUnused = (id) => {
  if (!id) return false;
  const existing = getRewards();
  let updated = false;
  const next = existing.map((reward) => {
    if (reward.id !== id) return reward;
    updated = true;
    return { ...reward, used: false, usedAt: null };
  });
  if (updated) safeSave(next);
  return updated;
};

export const deleteReward = (id) => {
  if (!id) return false;
  const existing = getRewards();
  const next = existing.filter((reward) => reward.id !== id);
  if (next.length === existing.length) return false;
  safeSave(next);
  return true;
};

export const clearAllRewards = () => safeSave([]);

export const rewardWalletEvents = {
  updated: REWARD_WALLET_UPDATED,
};

export {
  REWARD_TTL_MS,
  REWARD_WALLET_KEY,
  MAX_ACTIVE_REWARDS,
  safeParse,
  safeSave,
};
