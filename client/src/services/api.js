/**
 * Unified High-Performance API Client for Frontend & Admin Dashboard
 * Features: In-flight request deduplication & smart client caching
 */

const API_BASE = '/api';

const getAuthToken = () => {
  return localStorage.getItem('sakhawat_admin_token');
};

// In-flight request de-duplication cache
const inFlightRequests = new Map();
// Client-side memory cache (5 seconds TTL for GET requests)
const requestCache = new Map();

const request = async (endpoint, options = {}) => {
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const cacheKey = `${options.method || 'GET'}:${endpoint}`;

  // For GET requests, check if we have a fresh cached response (< 5s)
  if (isGet && !endpoint.includes('/admin') && !endpoint.includes('/auth')) {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5000) {
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

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      data = { success: false, message: 'Invalid response from server.' };
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

    if (isGet) {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    } else {
      // Clear cache on mutation
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
  get: (url, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;
    return request(finalUrl, { method: 'GET' });
  },

  post: (url, body) => {
    return request(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put: (url, body) => {
    return request(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: (url) => {
    return request(url, { method: 'DELETE' });
  },

  upload: (url, formData) => {
    return request(url, {
      method: 'POST',
      body: formData,
    });
  },

  clearCache: () => {
    requestCache.clear();
    inFlightRequests.clear();
  },
};
