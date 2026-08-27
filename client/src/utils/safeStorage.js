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
  'sakhawat_cached_admin_stats',
];

const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';

// Deep sanitizer to strip multi-megabyte base64 strings from local caches
const cleanObjectForCache = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectForCache);
  }
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.startsWith('data:image/') && v.length > 300) {
      clean[k] = DEFAULT_IMAGE_FALLBACK;
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = cleanObjectForCache(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
};

// Helper to format objects before storing
const sanitizeForStorage = (data) => {
  if (data === null || data === undefined) return '';
  try {
    const cleaned = typeof data === 'object' ? cleanObjectForCache(data) : data;
    return typeof cleaned === 'string' ? cleaned : JSON.stringify(cleaned);
  } catch (e) {
    return '';
  }
};

// Run one-time silent cleanup of legacy bloated keys
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('sakhawat_')) {
        const val = window.localStorage.getItem(k);
        if (val && val.length > 500000) {
          // Key is larger than 500KB (bloated base64) -> purge it
          window.localStorage.removeItem(k);
        }
      }
    }
  } catch (e) {}
}

export const safeSetItem = (key, value) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const sanitized = sanitizeForStorage(value);
    window.localStorage.setItem(key, sanitized);
  } catch (err) {
    // Silent quota exceeded handling
    try {
      for (const purgeKey of OVERSIZED_KEYS_TO_PURGE_ON_QUOTA) {
        if (purgeKey !== key) {
          window.localStorage.removeItem(purgeKey);
        }
      }
      const sanitized = sanitizeForStorage(value);
      window.localStorage.setItem(key, sanitized);
    } catch (retryErr) {
      // Ignored silently
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
