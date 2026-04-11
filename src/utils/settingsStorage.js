const SETTINGS_STORAGE_KEY = "apnagaon_launch_settings_v1";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  orderUpdates: true,
  offers: true,
  deliveryAlerts: true,
  rewards: true,
  partnerAlerts: true,
};

const DEFAULT_SETTINGS = {
  notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
};

const readSettings = () => {
  try {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      notificationPreferences: {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(parsed?.notificationPreferences || {}),
      },
    };
  } catch (error) {
    console.error("Error reading ApnaGaon settings:", error);
    return DEFAULT_SETTINGS;
  }
};

const writeSettings = (settings) => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving ApnaGaon settings:", error);
  }
};

export const getLaunchSettings = () => readSettings();

export const saveLaunchSettings = (nextSettings = {}) => {
  const merged = {
    ...readSettings(),
    ...nextSettings,
    notificationPreferences: {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(readSettings().notificationPreferences || {}),
      ...(nextSettings.notificationPreferences || {}),
    },
  };
  writeSettings(merged);
  return merged;
};

export const updateNotificationPreference = (key, value) => {
  const current = readSettings();
  const next = {
    ...current,
    notificationPreferences: {
      ...current.notificationPreferences,
      [key]: Boolean(value),
    },
  };
  writeSettings(next);
  return next;
};

export const resetLaunchSettings = () => {
  writeSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
};
