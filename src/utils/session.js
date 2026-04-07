export const SESSION_INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutos

const TOKEN_KEY = "token";
const USER_KEY = "user";
const LAST_ACTIVITY_KEY = "lastActivityAt";

export function touchActivity(now = Date.now()) {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  } catch {
    // ignore
  }
}

export function getLastActivity() {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function isInactive(limitMs = SESSION_INACTIVITY_LIMIT_MS, now = Date.now()) {
  const last = getLastActivity();
  if (!last) return false;
  return now - last >= limitMs;
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new Event("user-updated"));
  } catch {
    // ignore
  }
}

