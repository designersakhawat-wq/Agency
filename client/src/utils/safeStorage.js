/**
 * Enterprise Safe LocalStorage Utility
 * Reliable, non-destructive client storage handler.
 */

export const safeSetItem = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const formatted = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
    window.localStorage.setItem(key, formatted);
  } catch (err) {
    console.warn('Storage set error:', key, err.message);
  }
};

export const safeGetItem = (key, fallback = null) => {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw;
    }
  } catch (err) {
    return fallback;
  }
};

export const safeRemoveItem = (key) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {}
};

export default {
  setItem: safeSetItem,
  getItem: safeGetItem,
  removeItem: safeRemoveItem,
};
