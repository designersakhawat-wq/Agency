import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
  Tag,
  Target,
  Sliders,
  Play,
  Trash2,
  Eye,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  Calendar,
  Send,
  Share2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import tracking, { DEFAULT_TRACKING_CONFIG } from '../../services/trackingService';

export const AdminTrackingPage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [config, setConfig] = useState(DEFAULT_TRACKING_CONFIG);
  const [eventsLog, setEventsLog] = useState([]);
  const [activeTab, setActiveTab] = useState('config'); // config | events | diagnostics | attribution

  useEffect(() => {
    fetchTrackingSettings();
  }, []);

  const fetchTrackingSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.success && res.data?.tracking_config) {
        let parsed = res.data.tracking_config;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            parsed = {};
          }
        }
        const merged = {
          ...DEFAULT_TRACKING_CONFIG,
          ...parsed,
          events: {
            ...DEFAULT_TRACKING_CONFIG.events,
            ...(parsed?.events || {}),
          },
        };
        setConfig(merged);
        tracking.applyConfig(merged);
      } else {
        setConfig(DEFAULT_TRACKING_CONFIG);
      }
    } catch (err) {
      console.error('Failed to load tracking settings:', err);
      showToast('Could not load tracking settings, using defaults.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Clean pixel ID
      const cleanedConfig = {
        ...config,
        pixel_id: String(config.pixel_id || '').trim(),
      };

      const res = await api.post('/admin/settings/bulk', {
        settings: {
          tracking_config: cleanedConfig,
        },
      });

      if (res.success) {
        setConfig(cleanedConfig);
        tracking.applyConfig(cleanedConfig);
        showToast('Tracking configuration saved successfully and activated live!', 'success');
      } else {
        showToast(res.message || 'Failed to save tracking settings.', 'error');
      }
    } catch (err) {
      showToast('Network error while saving tracking configuration.', 'error');
    } finally {
      setSaving(false);
      setConfirmSaveOpen(false);
    }
  };

  const toggleEvent = (eventKey) => {
    setConfig((prev) => ({
      ...prev,
      events: {
        ...prev.events,
        [eventKey]: !prev.events[eventKey],
      },
    }));
  };

  // Test Event Simulator
  const handleTestEvent = (type) => {
    let result = false;
    if (type === 'PageView') {
      result = tracking.trackPageView('Test Public Page', '/test-landing');
    } else if (type === 'ViewContent') {
      result = tracking.trackViewContent('Logo & Brand Identity', 'Service', 280, 'USD', 'srv_branding_01');
    } else if (type === 'Lead') {
      result = tracking.trackLead('Contact Form Simulation', 500, 'USD', { test_lead: true });
    } else if (type === 'Schedule') {
      result = tracking.trackSchedule('Discovery Strategy Call', '2026-09-01', 0, 'USD');
    } else if (type === 'WhatsAppClick') {
      result = tracking.trackWhatsAppClick('Admin Test Button', 'Instant Quote', 'Social Media Ads (5 Creatives)');
    } else if (type === 'EstimateQuote') {
      result = tracking.trackEstimateQuote('Ad Creatives', 2250, 'BDT');
    }

    setEventsLog(tracking.getRecentEvents());

    if (result) {
      showToast(`🔥 Meta Pixel Event [${type}] fired successfully!`, 'success');
    } else {
      showToast(
        config.pixel_enabled
          ? `Event [${type}] is currently turned OFF in settings.`
          : 'Meta Pixel is currently OFF. Turn it ON above to fire events.',
        'info'
      );
    }
  };

  const handleClearLogs = () => {
    tracking.clearEventsLog();
    setEventsLog([]);
    showToast('Diagnostics log cleared.', 'info');
  };

  const isPixelActive = Boolean(config.pixel_enabled && config.pixel_id && config.pixel_id.trim().length >= 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader size="lg" />
        <span className="text-xs text-zinc-400 font-mono">Loading Tracking Control Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-zinc-800/80 shadow-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Centralized Meta Ads & Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
            Meta Pixel & Conversion Tracking
          </h1>
          <p className="text-xs text-zinc-400">
            Control Pixel ID, standard/custom events, campaign UTM attribution, and browser tracking without touching code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isPixelActive ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pixel Active</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Pixel Paused / OFF</span>
            </span>
          )}

          <Button
            variant="primary"
            icon={Save}
            onClick={() => setConfirmSaveOpen(true)}
            className="shadow-xl shadow-teal-950/50"
          >
            Save Tracking Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'config'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Pixel Core Configuration</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'events'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Conversion Events Controls</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('diagnostics');
            setEventsLog(tracking.getRecentEvents());
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Live Event Simulator & Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('attribution')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'attribution'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>UTM Attribution & Readiness</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PIXEL CORE CONFIGURATION
          ========================================================================= */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Main Pixel Setup Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-400" />
                  <span>Meta Pixel Master Switch</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Enable or disable all Meta tracking on the public website with a single click.
                </p>
              </div>

              {/* Master Toggle */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, pixel_enabled: !config.pixel_enabled })}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors cursor-pointer ${
                  config.pixel_enabled ? 'bg-teal-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    config.pixel_enabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Pixel ID Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Meta Pixel ID / Dataset ID</span>
                  <span className="text-[10px] text-teal-400 font-mono">Backend Controlled</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 123456789012345"
                    value={config.pixel_id || ''}
                    onChange={(e) => setConfig({ ...config, pixel_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-teal-500 shadow-inner"
                  />
                  {config.pixel_id && config.pixel_id.trim().length >= 5 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Find your Pixel ID inside Meta Events Manager → Data Sources → Settings.
                </p>
              </div>

              {/* Primary Conversion Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Primary Optimization Conversion Event
                </label>
                <select
                  value={config.primary_conversion || 'Lead'}
                  onChange={(e) => setConfig({ ...config, primary_conversion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Lead">🎯 Lead (Contact Form Submission & Project Quotes)</option>
                  <option value="Schedule">📅 Schedule (Strategy Meeting Bookings)</option>
                  <option value="Contact">💬 Contact (WhatsApp & Channel Clicks)</option>
                  <option value="ViewContent">👁️ ViewContent (Service & Portfolio Views)</option>
                </select>
                <p className="text-[11px] text-zinc-500">
                  Selects the focal goal for Meta Ads Campaign Optimization (Customizable anytime).
                </p>
              </div>
            </div>

            {/* Advanced Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
              {/* UTM Tracking Switch */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-teal-400" />
                    <span>UTM Campaign Attribution Capture</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Saves utm_source, utm_medium, and utm_campaign with incoming leads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, utm_tracking_enabled: !config.utm_tracking_enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    config.utm_tracking_enabled ? 'bg-teal-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.utm_tracking_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Debug Console Logger Switch */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Browser Console Debug Mode</span>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Outputs styled visual logs in the browser console when events fire.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, debug_mode: !config.debug_mode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    config.debug_mode ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.debug_mode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Optional Google Analytics 4 Card */}
          <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Google Analytics 4 (GA4) Hook (Future-Ready)</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Optional Google Analytics Measurement ID configuration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, ga_enabled: !config.ga_enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  config.ga_enabled ? 'bg-cyan-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.ga_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {config.ga_enabled && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-zinc-300">
                  GA4 Measurement ID (G-XXXXXXXXXX)
                </label>
                <input
                  type="text"
                  placeholder="e.g. G-ABC123XYZ"
                  value={config.ga_measurement_id || ''}
                  onChange={(e) => setConfig({ ...config, ga_measurement_id: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CONVERSION EVENTS CONTROLS
          ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-zinc-800 space-y-6">
            <div className="space-y-1 border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-400" />
                <span>Granular Event Firing Rules</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Turn specific standard and custom Meta events on or off without altering frontend templates.
              </p>
            </div>

            {/* Standard Meta Events Matrix */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">
                Standard Meta Pixel Events
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PageView */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">PageView</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        Standard
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires on every SPA public route navigation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('page_view')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.page_view ? 'bg-teal-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.page_view ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* ViewContent */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">ViewContent</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        Standard
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires when viewing Services, Packages & Case Studies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('view_content')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.view_content ? 'bg-teal-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.view_content ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Lead */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-teal-500/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-300">Lead</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                        Key Conversion
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires on successful Contact Form & Quote submissions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('lead')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.lead ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.lead ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Schedule */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-teal-500/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-300">Schedule</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold font-mono">
                        Key Conversion
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires when a client completes a meeting booking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('schedule')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.schedule ? 'bg-teal-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.schedule ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Contact */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Contact</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        Standard
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires when initiating contact via any communication channel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('contact')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.contact ? 'bg-teal-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.contact ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Custom High-Impact Meta Events */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                Custom High-Impact Conversion Events
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsAppClick */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsAppClick</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono">
                        Custom
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires on WhatsApp CTA clicks across estimator, packages & navbar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('whatsapp_click')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.whatsapp_click ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.whatsapp_click ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* EstimateQuote */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-cyan-500/20 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-300">EstimateQuote</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires when user locks in a project quote on the estimator.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('estimate_quote')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.estimate_quote ? 'bg-cyan-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.estimate_quote ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* ServiceInquiry */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">ServiceInquiry</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires when an inquiry is initiated on a specific service page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('service_inquiry')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.service_inquiry ? 'bg-teal-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.service_inquiry ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* CallClick */}
                <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">CallClick</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Fires when a visitor taps direct phone dial links.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleEvent('call_click')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      config.events?.call_click ? 'bg-teal-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.events?.call_click ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LIVE EVENT SIMULATOR & DIAGNOSTICS
          ========================================================================= */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          {/* Simulator Triggers */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-zinc-800 space-y-5">
            <div className="space-y-1 border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-400" />
                <span>Live Meta Pixel Event Simulator</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Trigger real Meta Pixel event dispatches in your active browser session to verify fbq execution & inspect payloads.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <button
                onClick={() => handleTestEvent('PageView')}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 text-zinc-200 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span>PageView</span>
              </button>

              <button
                onClick={() => handleTestEvent('ViewContent')}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-teal-500 text-zinc-200 hover:text-white text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              >
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>ViewContent</span>
              </button>

              <button
                onClick={() => handleTestEvent('Lead')}
                className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-emerald-950/20"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Lead ($500)</span>
              </button>

              <button
                onClick={() => handleTestEvent('Schedule')}
                className="p-3 rounded-2xl bg-zinc-900 border border-teal-500/40 hover:border-teal-400 text-teal-300 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              >
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Schedule</span>
              </button>

              <button
                onClick={() => handleTestEvent('WhatsAppClick')}
                className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleTestEvent('EstimateQuote')}
                className="p-3 rounded-2xl bg-zinc-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Quote (৳2.2k)</span>
              </button>
            </div>
          </div>

          {/* Live Diagnostics Log Card */}
          <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-white">Live Event Diagnostics Feed</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  {eventsLog.length} events logged
                </span>
              </div>

              {eventsLog.length > 0 && (
                <button
                  onClick={handleClearLogs}
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Feed</span>
                </button>
              )}
            </div>

            {eventsLog.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-mono space-y-1">
                <p>No events fired in this session yet.</p>
                <p className="text-zinc-600">Click any test button above or browse public pages to see live events stream in real time.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {eventsLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-teal-400 font-bold">
                        {log.type === 'trackCustom' ? '⚡ Custom Event' : '🎯 Standard Event'}:{' '}
                        <strong className="text-white text-sm">{log.eventName}</strong>
                      </span>
                      <span className="text-zinc-500">{log.timestamp}</span>
                    </div>
                    <pre className="text-[11px] text-zinc-300 bg-zinc-950 p-2 rounded-lg overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: UTM ATTRIBUTION & ADS READINESS
          ========================================================================= */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-zinc-800 space-y-6">
            <div className="space-y-1 border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Meta Ads Readiness Audit & Privacy Verification</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Verification checklist confirming enterprise tracking integrity, privacy adherence, and campaign attribution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero Hardcoded Pixel IDs</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Pixel ID is dynamically injected from the database. No static Pixel tokens remain in codebase.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SPA Route Deduplication Shield</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Route changes only fire single PageView events without duplicates. Admin panel routes are strictly isolated.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Privacy & PII Protection</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Passwords, raw auth tokens, and sensitive messages are strictly stripped before event payloads are dispatched.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hostinger & Render Safe Persistence</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Tracking configuration is persisted in permanent SQLite and included in real-time JSON snapshots.
                </p>
              </div>
            </div>

            {/* Campaign URL Builder Helper */}
            <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-2">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Meta Ads Campaign URL Example:</span>
              </span>
              <p className="text-xs text-zinc-300 font-mono bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 break-all select-all">
                https://sakhawat.design/?utm_source=facebook&utm_medium=paid_ad&utm_campaign=ad_creatives_q3&utm_content=video_demo_v1
              </p>
              <p className="text-[11px] text-zinc-400">
                When visitors land from this link, their source and campaign name will automatically attach to every inquiry or booking they submit!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={handleSaveSettings}
        title="Save Tracking & Pixel Configuration?"
        message="This will update your live Meta Pixel and conversion tracking settings immediately across the website."
        confirmText={saving ? 'Saving...' : 'Save & Activate'}
        variant="primary"
      />
    </div>
  );
};

export default AdminTrackingPage;
