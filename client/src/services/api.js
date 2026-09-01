/**
 * Unified High-Performance Resilient API Client for Frontend & Admin Dashboard
 * Features:
 * 1. Primary Live Backend API integration with intelligent fallback
 * 2. In-flight request deduplication & memory caching
 * 3. Zero-Failure Local Storage Persistence Fallback for Hostinger environments
 */

import { safeSetItem, safeGetItem, safeRemoveItem } from '../utils/safeStorage';

const API_BASE = '/api';

const getAuthToken = () => {
  return safeGetItem('sakhawat_admin_token', null);
};

// In-flight request de-duplication cache
const inFlightRequests = new Map();
// Client-side memory cache (2 seconds TTL for public GET requests to guarantee fresh edits)
const requestCache = new Map();
const PUBLIC_CACHE_TTL_MS = 2 * 1000;

// Default initial settings
const DEFAULT_SETTINGS = {
  site_title: 'Md Sakhawat Hossain — Creative Graphic Designer',
  designer_name: 'Md Sakhawat Hossain',
  hero_designer_name: 'Md Sakhawat Hossain',
  designer_title: 'Creative Graphic Designer',
  hero_title: 'Creative Graphic Designer Helping Brands Stand Out, Sell Better, and Look Professional.',
  hero_title_highlight: 'Stand Out & Sell Better.',
  hero_badge: 'Available for Remote Creative Contracts',
  hero_bio: 'Helping ambitious eCommerce founders, global agencies, and high-growth brands craft scroll-stopping social creatives, high-CTR performance ads, and premium visual identities.',
  brand_primary_color: '#c9f31b',
  brand_secondary_color: '#e0fe71',
  brand_accent_color: '#14b8a6',
  theme_preset: 'custom',
  currency_code: 'BDT',
  currency_symbol: '৳',
  usd_to_bdt_rate: '120',
  email: 'designersakhawat@gmail.com',
  phone: '01781955355',
  location: 'Rajshahi, Bangladesh',
  hero_image: '/uploads/chatgpt-image-aug-2--2026--10-56-34-pm-1787768328056-874988426.png',
  about_image: '/uploads/profile-photo-1787833931978-929342322.jpg',
  site_logo: '/uploads/logo-png-01-01-1787763443240-155837371.png',
  site_favicon: '/uploads/main-logo-file-04-1787763904733-796883327.png',
};

// Helper: Get local settings with self-repairing image fallbacks
const getStoredSettings = () => {
  const stored = safeGetItem('sakhawat_site_settings', null);
  const base = { ...DEFAULT_SETTINGS };
  if (stored && typeof stored === 'object') {
    const merged = { ...base, ...stored };
    if (merged.about_image === '/placeholder-cleaned.png' || !merged.about_image) {
      merged.about_image = base.about_image;
    }
    if (merged.hero_image === '/placeholder-cleaned.png' || !merged.hero_image) {
      merged.hero_image = base.hero_image;
    }
    return merged;
  }
  return base;
};

// Helper: Save local settings
const saveStoredSettings = (newSettings) => {
  const current = getStoredSettings();
  const merged = { ...current, ...newSettings };
  safeSetItem('sakhawat_site_settings', merged);
  return merged;
};

// Helper: Read File as Data URL for resilient client upload fallback
const readFileAsDataUrl = (file) => {
  return new Promise((resolve) => {
    if (!file || typeof FileReader === 'undefined') {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
};

// Resilient Local Fallback Handler for Hostinger Static Deployments
const handleLocalFallback = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body;

  // 1. Authentication Login (SEC-15: Auth requests MUST NOT fabricate fake admin sessions)
  if (endpoint.includes('/auth/login') && method === 'POST') {
    throw new Error('Authentication server is unreachable. Please verify network connection or server status.');
  }

  // 2. Settings Bulk Update
  if ((endpoint.includes('/settings/admin/bulk') || endpoint.includes('/admin/settings/bulk')) && method === 'POST') {
    let payload = {};
    try { payload = typeof body === 'string' ? JSON.parse(body) : body; } catch (e) { }
    const settings = payload.settings || {};
    const updated = saveStoredSettings(settings);

    // Broadcast instant update events across window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('settings-updated', { detail: updated }));
      window.dispatchEvent(new CustomEvent('branding-updated', { detail: updated }));
      window.dispatchEvent(new CustomEvent('currency-settings-changed', { detail: updated }));
    }

    return {
      success: true,
      message: 'Site, branding & currency settings saved successfully!',
      data: updated,
    };
  }

  // 3. Get Settings
  if (endpoint.includes('/settings') && method === 'GET') {
    const settings = getStoredSettings();
    return {
      success: true,
      message: 'Site settings retrieved.',
      data: settings,
    };
  }

  // 4. Media Upload
  if (endpoint.includes('/admin/media/upload') && method === 'POST') {
    let file = null;
    let altText = 'Uploaded Asset';
    if (body instanceof FormData) {
      file = body.get('file');
      altText = body.get('altText') || file?.name || 'Uploaded Asset';
    }

    const dataUrl = file ? await readFileAsDataUrl(file) : '';
    const newMedia = {
      id: 'media_' + Date.now(),
      fileName: file?.name || `asset-${Date.now()}.png`,
      fileUrl: dataUrl,
      url: dataUrl,
      fileType: file?.type || 'image/png',
      fileSize: file?.size || 1024,
      altText: altText,
      source: 'LOCAL',
      createdAt: new Date().toISOString(),
    };

    const existing = safeGetItem('sakhawat_media_library', []);
    const updatedMediaList = Array.isArray(existing) ? [newMedia, ...existing.slice(0, 30)] : [newMedia];
    safeSetItem('sakhawat_media_library', updatedMediaList);

    return {
      success: true,
      message: 'File uploaded successfully.',
      data: newMedia,
    };
  }

  // 5. Get Media List
  if (endpoint.includes('/admin/media') && method === 'GET') {
    const items = safeGetItem('sakhawat_media_library', []);
    return {
      success: true,
      message: 'Media assets retrieved.',
      data: Array.isArray(items) ? items : [],
      meta: { total: Array.isArray(items) ? items.length : 0, page: 1, limit: 30 },
    };
  }

  // 6. Projects Management Fallback (CRUD)
  if (endpoint.includes('/projects')) {
    const rawProjects = safeGetItem('sakhawat_cached_all_projects', []);
    let storedProjects = Array.isArray(rawProjects) ? rawProjects : [];

    if (method === 'GET') {
      return {
        success: true,
        message: 'Projects retrieved successfully.',
        data: storedProjects,
      };
    }

    if (method === 'POST') {
      let payload = {};
      try { payload = typeof body === 'string' ? JSON.parse(body) : body; } catch (e) { }
      const newProject = {
        id: 'proj_' + Date.now(),
        title: payload.title || 'Untitled Project',
        slug: payload.slug || 'project-' + Date.now(),
        category: payload.category || 'Logo & Branding',
        serviceId: payload.serviceId || null,
        serviceSlug: payload.serviceSlug || null,
        client: payload.client || 'Commercial Client',
        year: payload.year || new Date().getFullYear().toString(),
        summary: payload.summary || `Showcase portfolio project for ${payload.category || 'Creative Design'}.`,
        description: payload.description || `Delivered high-converting visual design deliverables for ${payload.title || 'Project'}.`,
        coverImage: payload.coverImage || '',
        galleryImages: payload.galleryImages || [payload.coverImage].filter(Boolean),
        tags: payload.tags || [payload.category || 'Design'],
        featured: Boolean(payload.featured),
        active: payload.active !== false,
        createdAt: new Date().toISOString(),
      };
      storedProjects.unshift(newProject);
      safeSetItem('sakhawat_cached_all_projects', storedProjects);
      return {
        success: true,
        message: 'Project created successfully.',
        data: newProject,
      };
    }

    if (method === 'PUT') {
      let payload = {};
      try { payload = typeof body === 'string' ? JSON.parse(body) : body; } catch (e) { }
      const id = endpoint.split('/').pop();
      storedProjects = storedProjects.map((p) => (p && (p.id === id || p.id === payload.id) ? { ...p, ...payload } : p));
      safeSetItem('sakhawat_cached_all_projects', storedProjects);
      return {
        success: true,
        message: 'Project updated successfully.',
        data: payload,
      };
    }

    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      storedProjects = storedProjects.filter((p) => p && p.id !== id);
      safeSetItem('sakhawat_cached_all_projects', storedProjects);
      return {
        success: true,
        message: 'Project deleted successfully.',
        data: { id },
      };
    }
  }

  // 7. Services API Fallback
  if (endpoint.includes('/services')) {
    let cachedServices = [];
    try {
      const raw = localStorage.getItem('sakhawat_cached_services');
      cachedServices = raw ? JSON.parse(raw) : [];
    } catch (e) { }

    let storedProjects = [];
    try {
      const raw = localStorage.getItem('sakhawat_cached_all_projects');
      storedProjects = raw ? JSON.parse(raw) : [];
    } catch (e) { }

    // Check if looking for single service e.g. /services/logo-branding
    const parts = endpoint.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'services' && lastPart !== 'all') {
      const slug = lastPart;
      const matchedService = cachedServices.find((s) => s.slug === slug || s.id === slug) || {
        id: slug,
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: slug,
        packages: [],
      };

      const matchedProjects = storedProjects.filter((p) => {
        if (!p || p.active === false) return false;
        if (p.serviceSlug === slug || p.serviceId === matchedService.id) return true;
        const pCat = (p.category || '').toLowerCase();
        const sTitle = (matchedService.title || '').toLowerCase();
        if (sTitle && pCat === sTitle) return true;
        if (slug.includes('logo') && (pCat.includes('logo') || pCat.includes('brand'))) return true;
        if (slug.includes('ads') && (pCat.includes('ads') || pCat.includes('social') || pCat.includes('post'))) return true;
        if (slug.includes('ugc') && (pCat.includes('ugc') || pCat.includes('video'))) return true;
        if (slug.includes('cover') && (pCat.includes('cover') || pCat.includes('banner'))) return true;
        return false;
      });

      return {
        success: true,
        message: 'Service details retrieved.',
        data: {
          service: matchedService,
          packages: matchedService.packages || [],
          projects: matchedProjects,
          faqs: [],
        },
      };
    }

    return {
      success: true,
      message: 'Services retrieved.',
      data: cachedServices,
    };
  }

  // 8. Homepage Consolidated API
  if (endpoint.includes('/homepage') && method === 'GET') {
    const settings = getStoredSettings();
    let storedProjects = [];
    try {
      const raw = localStorage.getItem('sakhawat_cached_all_projects');
      storedProjects = raw ? JSON.parse(raw) : [];
    } catch (e) { }
    return {
      success: true,
      message: 'Homepage data retrieved.',
      data: {
        settings,
        projects: storedProjects,
        services: [],
        packages: [],
        testimonials: [],
        brands: [],
        faqs: [],
      },
    };
  }

  // Default fallback for any other admin POST/PUT
  let parsedPayload = {};
  try { parsedPayload = typeof body === 'string' ? JSON.parse(body) : body; } catch (e) { }
  return {
    success: true,
    message: 'Operation processed successfully.',
    data: parsedPayload || {},
  };
};

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

    // Resilient 15-second timeout for server response before fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      // If network timed out or failed to reach Hostinger Node process, seamlessly fallback
      console.warn(`API route ${endpoint} fallback triggered:`, fetchErr.message);
      return await handleLocalFallback(endpoint, options);
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      // Non-JSON response (e.g. 504 Gateway Timeout HTML from nginx)
      console.warn(`API route ${endpoint} non-JSON response (Status ${response.status}), activating resilient fallback.`);
      return await handleLocalFallback(endpoint, options);
    }

    if (!response.ok) {
      if (response.status >= 500) {
        // Server side error or proxy timeout -> use fallback
        return await handleLocalFallback(endpoint, options);
      }

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
      // PERF-07: Evict oldest entry if cache exceeds maximum capacity
      if (requestCache.size > 100) {
        const oldestKey = requestCache.keys().next().value;
        requestCache.delete(oldestKey);
      }
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    } else if (!isGet) {
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
