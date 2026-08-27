/**
 * Enterprise Safe LocalStorage Utility
 * Prevents QuotaExceededError and memory exhaustion by:
 * - Filtering out oversized Base64 data URLs
 * - Automatically purging stale/heavy cache when quota limit is approached
 * - Handling all operations silently with fallback defaults
 */

const OVERSIZED_KEYS_TO_PURGE_ON_QUOTA = [
  'sakhawat_media_library',
  'sakhawat_cached_all_projects',
  'sakhawat_cached_featured_projects',
  'sakhawat_cached_brand',
];

// Helper to sanitize objects before storing
const sanitizeForStorage = (data) => {
  if (!data) return data;
  try {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    // Replace any base64 image strings longer than 500 chars with placeholder to save MBs of space
    const cleanedStr = jsonStr.replace(/"data:image\/[^"]{500,}"/g, '"/placeholder-cleaned.png"');
    return cleanedStr;
  } catch (e) {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
};

export const safeSetItem = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const sanitized = sanitizeForStorage(value);
    window.localStorage.setItem(key, sanitized);
  } catch (err) {
    // QuotaExceededError handling
    console.warn(`LocalStorage quota exceeded while saving "${key}". Auto-purging heavy cache...`);
    try {
      // Purge disposable caches
      for (const purgeKey of OVERSIZED_KEYS_TO_PURGE_ON_QUOTA) {
        if (purgeKey !== key) {
          window.localStorage.removeItem(purgeKey);
        }
      }
      // Retry once after purge
      const sanitized = sanitizeForStorage(value);
      window.localStorage.setItem(key, sanitized);
    } catch (retryErr) {
      console.warn(`LocalStorage write skipped for "${key}" due to storage limit.`);
    }
  }
};

export const safeGetItem = (key, fallback = null) => {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
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
