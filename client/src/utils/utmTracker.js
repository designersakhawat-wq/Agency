/**
 * UTM & Campaign Attribution Engine
 * Captures, normalizes, and persists UTM parameters across multi-page user journeys.
 */

const UTM_STORAGE_KEY = 'sakhawat_lead_attribution_v1';

export const initUtmCapture = () => {
  if (typeof window === 'undefined') return {};

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmContent = urlParams.get('utm_content');
    const utmTerm = urlParams.get('utm_term');

    // Also detect direct social/ad referrers if no explicit UTM
    let inferredSource = null;
    let inferredMedium = null;
    const ref = document.referrer ? document.referrer.toLowerCase() : '';

    if (ref) {
      if (ref.includes('facebook.com') || ref.includes('fb.com')) {
        inferredSource = 'Facebook';
        inferredMedium = 'social_referral';
      } else if (ref.includes('instagram.com')) {
        inferredSource = 'Instagram';
        inferredMedium = 'social_referral';
      } else if (ref.includes('linkedin.com')) {
        inferredSource = 'LinkedIn';
        inferredMedium = 'social_referral';
      } else if (ref.includes('google.com')) {
        inferredSource = 'Google';
        inferredMedium = 'organic_search';
      } else if (ref.includes('tiktok.com')) {
        inferredSource = 'TikTok';
        inferredMedium = 'social_referral';
      } else if (ref.includes('youtube.com')) {
        inferredSource = 'YouTube';
        inferredMedium = 'video_referral';
      }
    }

    // Only update storage if we have incoming UTM parameters or inferred source, or if storage is empty
    const existingRaw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : null;

    if (utmSource || utmCampaign || (!existing && inferredSource)) {
      const attribution = {
        utmSource: utmSource || inferredSource || 'Direct / Organic',
        utmMedium: utmMedium || inferredMedium || 'web',
        utmCampaign: utmCampaign || 'Direct Traffic',
        utmContent: utmContent || '',
        utmTerm: utmTerm || '',
        landingPage: window.location.pathname + window.location.search,
        referrer: document.referrer || 'Direct Visit',
        firstTouchTime: new Date().toISOString(),
      };

      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attribution));
      return attribution;
    }

    if (!existing) {
      const defaultAttribution = {
        utmSource: 'Direct / Organic',
        utmMedium: 'direct',
        utmCampaign: 'organic_visit',
        utmContent: '',
        utmTerm: '',
        landingPage: window.location.pathname,
        referrer: document.referrer || 'Direct Navigation',
        firstTouchTime: new Date().toISOString(),
      };
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(defaultAttribution));
      return defaultAttribution;
    }

    return existing;
  } catch (err) {
    console.warn('[UTM Tracker] Warning:', err);
    return {
      utmSource: 'Direct',
      utmMedium: 'direct',
      utmCampaign: 'direct',
      landingPage: window.location.pathname || '/',
      referrer: document.referrer || '',
    };
  }
};

/**
 * Retrieve current attribution parameters to attach to Leads & Bookings
 */
export const getAttributionData = () => {
  if (typeof window === 'undefined') {
    return {
      utmSource: 'Direct',
      utmMedium: 'direct',
      utmCampaign: 'direct',
      landingPage: '/',
      referrer: '',
    };
  }

  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  return initUtmCapture();
};

export default {
  initUtmCapture,
  getAttributionData,
};
