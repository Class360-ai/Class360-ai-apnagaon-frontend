const POINTS_STORAGE_KEY = "apnagaon_reward_points";
const DAILY_VISIT_STORAGE_KEY = "apnagaon_reward_daily_visit";
const INVITE_COUNT_STORAGE_KEY = "apnagaon_reward_invite_count";
const POINTS_UPDATED_EVENT = "apnagaon:points-updated";

const safeParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emitPointsUpdated = (points) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(POINTS_UPDATED_EVENT, { detail: { points } }));
};

export const getRewardPoints = () => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(POINTS_STORAGE_KEY);
  const data = safeParse(raw, { points: 0 });
  const points = Number(data?.points);
  return Number.isFinite(points) && points > 0 ? Math.floor(points) : 0;
};

export const addRewardPoints = (pointsToAdd = 0) => {
  if (typeof window === "undefined") return 0;
  const safePoints = Number(pointsToAdd);
  if (!Number.isFinite(safePoints) || safePoints <= 0) {
    return getRewardPoints();
  }
  const next = getRewardPoints() + Math.floor(safePoints);
  window.localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify({ points: next }));
  emitPointsUpdated(next);
  return next;
};

export const canClaimDailyVisit = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DAILY_VISIT_STORAGE_KEY) !== getTodayKey();
};

export const claimDailyVisitPoints = (points = 5) => {
  if (typeof window === "undefined") return { claimed: false, points: 0 };
  if (!canClaimDailyVisit()) {
    return { claimed: false, points: getRewardPoints() };
  }
  window.localStorage.setItem(DAILY_VISIT_STORAGE_KEY, getTodayKey());
  const updatedPoints = addRewardPoints(points);
  return { claimed: true, points: updatedPoints };
};

export const rewardPointsEvents = {
  updated: POINTS_UPDATED_EVENT,
};

export const getInviteCount = () => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(INVITE_COUNT_STORAGE_KEY);
  const count = Number(raw);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
};

export const incrementInviteCount = () => {
  if (typeof window === "undefined") return 0;
  const next = getInviteCount() + 1;
  window.localStorage.setItem(INVITE_COUNT_STORAGE_KEY, String(next));
  return next;
};
