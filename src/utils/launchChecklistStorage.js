const STORAGE_KEY = "apnagaon_launch_checklist_v1";

export const DEFAULT_LAUNCH_CHECKLIST = {
  "frontend-deployed": false,
  "backend-deployed": false,
  "database-connected": false,
  "domain-connected": false,
  "env-configured": false,
  "products-ready": false,
  "shops-ready": false,
  "delivery-ready": false,
  "payments-ready": false,
  "support-ready": false,
  "notifications-ready": false,
  "legal-ready": false,
};

const readState = () => {
  try {
    if (typeof window === "undefined") return DEFAULT_LAUNCH_CHECKLIST;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAUNCH_CHECKLIST;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_LAUNCH_CHECKLIST, ...(parsed || {}) };
  } catch (error) {
    console.error("Error reading launch checklist:", error);
    return DEFAULT_LAUNCH_CHECKLIST;
  }
};

const writeState = (state) => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving launch checklist:", error);
  }
};

export const getLaunchChecklistState = () => readState();

export const toggleLaunchChecklistItem = (key) => {
  const current = readState();
  const next = {
    ...current,
    [key]: !current[key],
  };
  writeState(next);
  return next;
};

export const setLaunchChecklistItem = (key, value) => {
  const current = readState();
  const next = {
    ...current,
    [key]: Boolean(value),
  };
  writeState(next);
  return next;
};

export const resetLaunchChecklist = () => {
  writeState(DEFAULT_LAUNCH_CHECKLIST);
  return DEFAULT_LAUNCH_CHECKLIST;
};

export const getLaunchChecklistProgress = (state = DEFAULT_LAUNCH_CHECKLIST) => {
  const items = Object.values(state);
  const completed = items.filter(Boolean).length;
  return {
    completed,
    total: items.length,
    percent: items.length ? Math.round((completed / items.length) * 100) : 0,
  };
};
