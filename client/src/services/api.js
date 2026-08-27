/**
 * Unified High-Performance API Client for Frontend & Admin Dashboard
 * Features: In-flight request deduplication, resilient timeouts & intelligent tiered caching
 */

const API_BASE = '/api';

const getAuthToken = () => {
  return localStorage.getItem('sakhawat_admin_token');
};

// In-flight request de-duplication cache
const inFlightRequests = new Map();
// Client-side memory cache (60 seconds TTL for public GET requests)
const requestCache = new Map();
const PUBLIC_CACHE_TTL_MS = 60 * 1000; // 60 seconds

const request = async (endpoint, options = {}) => {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const forceRefresh = Boolean(options.forceRefresh);
  const cacheKey = `${options.method || 'GET'}:${endpoint}`;

  // For GET requests, check if we have a fresh cached response (< 60s) unless forceRefresh
  if (isGet && !forceRefresh && !endpoint.includes('/admin') && !endpoint.includes('/auth')) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < PUBLIC_CACHE_TTL_MS) {
      return cached.data;
    }

    // In-flight deduplication: if identical GET is already ongoing, share the promise
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    const token = getAuthToken();
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is NOT FormData, default to application/json
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    // 45-second AbortController timeout protection for large uploads & remote cloud operations
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        throw new Error('Network request timed out. Please check your internet connection.');
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      if (response.status === 403) {
        data = { success: false, message: 'Server deployment is initializing on Hostinger. Please allow 30 seconds and retry.' };
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        data = { success: false, message: 'Hostinger Node process is rebooting. Please retry in a few seconds.' };
      } else {
        data = { success: false, message: 'Invalid response from server.' };
      }
    }

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('sakhawat_admin_token');
        localStorage.removeItem('sakhawat_admin_user');
      }
      const error = new Error(data.message || 'An error occurred during request.');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (isGet && !endpoint.includes('/admin') && !endpoint.includes('/auth')) {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    } else if (!isGet) {
      // Clear cache on any mutation (POST/PUT/DELETE/upload)
      requestCache.clear();
    }

    return data;
  })();

  if (isGet && !endpoint.includes('/admin') && !endpoint.includes('/auth')) {
    inFlightRequests.set(cacheKey, fetchPromise);
    fetchPromise.finally(() => inFlightRequests.delete(cacheKey));
  }

  return fetchPromise;
};

export const api = {
  get: (url, params = {}, options = {}) => {
    const cleanParams = {};
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((k) => {
        const val = params[k];
        if (
          val !== undefined &&
          val !== null &&
          val !== '' &&
          val !== 'undefined' &&
          val !== 'null'
        ) {
          cleanParams[k] = val;
        }
      });
    }
    const queryString = new URLSearchParams(cleanParams).toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    return request(finalUrl, { method: 'GET', ...options });
  },

  post: (url, body, options = {}) => {
    return request(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  },

  put: (url, body, options = {}) => {
    return request(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  },

  delete: (url, options = {}) => {
    return request(url, { method: 'DELETE', ...options });
  },

  upload: (url, formData, options = {}) => {
    return request(url, {
      method: 'POST',
      body: formData,
      ...options,
    });
  },

  clearCache: () => {
    requestCache.clear();
    inFlightRequests.clear();
  },
};
