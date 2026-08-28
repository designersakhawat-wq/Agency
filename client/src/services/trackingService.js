/**
 * Centralized Meta Pixel & Conversion Tracking Engine
 * Dynamic, Backend-Controlled, SPA-Safe, Privacy-First Architecture.
 */

import { api } from './api';

export const DEFAULT_TRACKING_CONFIG = {
  pixel_enabled: false,
  pixel_id: '',
  primary_conversion: 'Lead',
  ga_enabled: false,
  ga_measurement_id: '',
  utm_tracking_enabled: true,
  debug_mode: false,
  events: {
    page_view: true,
    view_content: true,
    lead: true,
    contact: true,
    schedule: true,
    whatsapp_click: true,
    call_click: true,
    email_click: true,
    service_inquiry: true,
    estimate_quote: true,
  },
};

class TrackingService {
  constructor() {
    this.config = { ...DEFAULT_TRACKING_CONFIG };
    this.isInitialized = false;
    this.currentPixelId = null;
    this.lastTrackedPage = null;
    this.recentEventsLog = [];
  }

  /**
   * Initialize or update tracking configuration from backend settings
   */
  async init(forcedConfig = null) {
    if (typeof window === 'undefined') return;

    if (forcedConfig) {
      this.applyConfig(forcedConfig);
      return;
    }

    try {
      const res = await api.get('/settings').catch(() => null);
      if (res && res.success && res.data?.tracking_config) {
        let parsed = res.data.tracking_config;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            parsed = {};
          }
        }
        this.applyConfig(parsed);
      } else {
        this.applyConfig(DEFAULT_TRACKING_CONFIG);
      }
    } catch (err) {
      console.warn('[Tracking Engine] Config fetch warning:', err.message);
      this.applyConfig(DEFAULT_TRACKING_CONFIG);
    }
  }

  /**
   * Apply configuration and mount/unmount Pixel scripts dynamically
   */
  applyConfig(newConfig) {
    this.config = {
      ...DEFAULT_TRACKING_CONFIG,
      ...newConfig,
      events: {
        ...DEFAULT_TRACKING_CONFIG.events,
        ...(newConfig?.events || {}),
      },
    };

    const pixelId = String(this.config.pixel_id || '').trim();
    const isEnabled = Boolean(this.config.pixel_enabled && pixelId.length >= 5);

    if (this.config.debug_mode) {
      console.log(
        '%c[Tracking Engine] Config Updated%c Status: ' + (isEnabled ? 'ACTIVE (Pixel: ' + pixelId + ')' : 'PAUSED / OFF'),
        'background: #1877f2; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        'color: ' + (isEnabled ? '#10b981' : '#f59e0b') + '; font-weight: bold;',
        this.config
      );
    }

    if (isEnabled) {
      this.injectMetaPixelScript(pixelId);
    } else {
      this.currentPixelId = null;
      if (window.fbq) {
        window.fbq.disable = true;
      }
    }
  }

  /**
   * Safely inject the official Meta Pixel base script once
   */
  injectMetaPixelScript(pixelId) {
    if (typeof window === 'undefined') return;

    if (window.fbq && this.currentPixelId === pixelId) {
      window.fbq.disable = false;
      return;
    }

    // Standard Meta Pixel snippet
    if (!window._fbq) {
      /* eslint-disable */
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    try {
      window.fbq.disable = false;
      window.fbq('init', pixelId);
      this.currentPixelId = pixelId;
      this.isInitialized = true;

      if (this.config.debug_mode) {
        console.log(
          '%c[Meta Pixel]%c Initialized successfully with ID: ' + pixelId,
          'background: #1877f2; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
          'color: #10b981; font-weight: bold;'
        );
      }
    } catch (e) {
      console.warn('[Meta Pixel] Init error:', e);
    }
  }

  /**
   * Internal Event Dispatcher
   */
  dispatch(eventType, eventName, payload = {}, configKey = null) {
    if (!this.config.pixel_enabled || !this.currentPixelId) {
      if (this.config.debug_mode) {
        console.log(
          `%c[Tracking Paused]%c Event: ${eventName} skipped (Pixel is OFF)`,
          'background: #71717a; color: #fff; padding: 2px 6px; border-radius: 4px;',
          'color: #a1a1aa;'
        );
      }
      return false;
    }

    if (configKey && this.config.events[configKey] === false) {
      if (this.config.debug_mode) {
        console.log(
          `%c[Event Disabled]%c Event: ${eventName} (key: ${configKey}) is turned OFF in admin settings`,
          'background: #f59e0b; color: #000; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
          'color: #f59e0b;'
        );
      }
      return false;
    }

    // Sanitize payload: never send unhashed sensitive passwords / credentials
    const safePayload = { ...payload };
    delete safePayload.password;
    delete safePayload.token;

    // Record to local memory log for admin live diagnostics
    const logItem = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      type: eventType,
      eventName,
      configKey,
      payload: safePayload,
    };
    this.recentEventsLog.unshift(logItem);
    if (this.recentEventsLog.length > 50) this.recentEventsLog.pop();

    // Trigger Meta Pixel `fbq`
    try {
      if (typeof window !== 'undefined' && window.fbq) {
        if (eventType === 'trackCustom') {
          window.fbq('trackCustom', eventName, safePayload);
        } else {
          window.fbq('track', eventName, safePayload);
        }
      }
    } catch (err) {
      console.warn(`[Meta Pixel] Failed to track ${eventName}:`, err);
    }

    // Debug output
    if (this.config.debug_mode) {
      console.log(
        `%c[Meta Pixel]%c 🎯 ${eventType === 'trackCustom' ? 'Custom Event' : 'Standard Event'}: %c${eventName}`,
        'background: #1877f2; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        'color: #94a3b8;',
        'color: #38bdf8; font-weight: bold;',
        safePayload
      );
    }

    return true;
  }

  // =========================================================================
  // STANDARD META EVENTS
  // =========================================================================

  /**
   * Track SPA Route / Page View
   */
  trackPageView(pageTitle = '', path = '') {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (this.lastTrackedPage === currentPath) return; // Prevent duplicate immediate fires
    this.lastTrackedPage = currentPath;

    return this.dispatch(
      'track',
      'PageView',
      {
        page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
        page_path: currentPath,
      },
      'page_view'
    );
  }

  /**
   * Track Viewing Service, Package, or Portfolio Case Study
   */
  trackViewContent(contentName, contentCategory = 'General', value = null, currency = 'USD', contentId = null) {
    const payload = {
      content_name: contentName,
      content_category: contentCategory,
    };
    if (contentId) payload.content_ids = [String(contentId)];
    if (value !== null && !isNaN(value)) {
      payload.value = Number(value);
      payload.currency = currency || 'USD';
    }
    return this.dispatch('track', 'ViewContent', payload, 'view_content');
  }

  /**
   * Track Qualified Potential Client Lead (Contact Form Submission / Project Estimate)
   */
  trackLead(leadType = 'Contact Form', value = null, currency = 'USD', metadata = {}) {
    const payload = {
      content_name: leadType,
      ...metadata,
    };
    if (value !== null && !isNaN(value)) {
      payload.value = Number(value);
      payload.currency = currency || 'USD';
    }
    return this.dispatch('track', 'Lead', payload, 'lead');
  }

  /**
   * Track 1-on-1 Discovery Meeting Booking / Schedule
   */
  trackSchedule(serviceName = 'Consultation', date = null, value = null, currency = 'USD') {
    const payload = {
      content_name: serviceName,
      content_category: 'Meeting Booking',
    };
    if (date) payload.scheduled_date = date;
    if (value !== null && !isNaN(value)) {
      payload.value = Number(value);
      payload.currency = currency || 'USD';
    }
    return this.dispatch('track', 'Schedule', payload, 'schedule');
  }

  /**
   * Track General Contact Intent
   */
  trackContact(channel = 'WhatsApp', metadata = {}) {
    return this.dispatch(
      'track',
      'Contact',
      {
        contact_channel: channel,
        ...metadata,
      },
      'contact'
    );
  }

  // =========================================================================
  // CUSTOM HIGH-VALUE META EVENTS
  // =========================================================================

  /**
   * Track High-Conversion WhatsApp CTA Clicks
   */
  trackWhatsAppClick(sourceLocation = 'Navbar', messageIntent = 'General Inquiry', quoteSummary = null) {
    const payload = {
      cta_location: sourceLocation,
      intent: messageIntent,
    };
    if (quoteSummary) payload.quote_summary = quoteSummary;

    // Track standard Contact event if enabled
    this.trackContact('WhatsApp', { cta_location: sourceLocation });

    // Track dedicated Custom WhatsAppClick event
    return this.dispatch('trackCustom', 'WhatsAppClick', payload, 'whatsapp_click');
  }

  /**
   * Track Phone Call CTA Clicks
   */
  trackCallClick(phoneNumber = '', sourceLocation = 'Footer') {
    this.trackContact('Phone', { cta_location: sourceLocation });
    return this.dispatch(
      'trackCustom',
      'CallClick',
      {
        phone: phoneNumber,
        location: sourceLocation,
      },
      'call_click'
    );
  }

  /**
   * Track Direct Email CTA Clicks
   */
  trackEmailClick(emailAddress = '', sourceLocation = 'Contact Page') {
    this.trackContact('Email', { cta_location: sourceLocation });
    return this.dispatch(
      'trackCustom',
      'EmailClick',
      {
        email: emailAddress,
        location: sourceLocation,
      },
      'email_click'
    );
  }

  /**
   * Track Service Specific Inquiry Initiation
   */
  trackServiceInquiry(serviceTitle = '', serviceSlug = '') {
    return this.dispatch(
      'trackCustom',
      'ServiceInquiry',
      {
        service_title: serviceTitle,
        service_slug: serviceSlug,
      },
      'service_inquiry'
    );
  }

  /**
   * Track Project Cost Estimate Quote Generation / Lock In
   */
  trackEstimateQuote(serviceName, totalAmount, currency = 'USD') {
    return this.dispatch(
      'trackCustom',
      'EstimateQuote',
      {
        service_name: serviceName,
        estimated_total: totalAmount,
        currency,
      },
      'estimate_quote'
    );
  }

  /**
   * Direct Custom Event Track
   */
  trackCustom(eventName, payload = {}) {
    return this.dispatch('trackCustom', eventName, payload);
  }

  /**
   * Retrieve recent log for Admin Diagnostics View
   */
  getRecentEvents() {
    return [...this.recentEventsLog];
  }

  /**
   * Clear local memory diagnostics log
   */
  clearEventsLog() {
    this.recentEventsLog = [];
  }
}

export const tracking = new TrackingService();
export default tracking;
