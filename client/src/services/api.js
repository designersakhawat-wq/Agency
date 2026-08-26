/**
 * Unified API Client for Frontend & Admin Dashboard
 */

const API_BASE = '/api';

const getAuthToken = () => {
  return localStorage.getItem('sakhawat_admin_token');
};

const request = async (endpoint, options = {}) => {
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
    // If 401 Unauthorized and not on login page, optionally clear token
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('sakhawat_admin_token');
      localStorage.removeItem('sakhawat_admin_user');
    }
    const error = new Error(data.message || 'An error occurred during request.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
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
};
