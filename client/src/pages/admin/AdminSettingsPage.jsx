import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useBrand, THEME_PRESETS, getSuggestedSecondColors, getContrastTextColor } from '../../context/BrandContext';
import {
  Settings,
  Save,
  ShieldCheck,
  Globe,
  User,
  Share2,
  Mail,
  Lock,
  DollarSign,
  Coins,
  TrendingUp,
  Sparkles,
  Palette,
  Upload,
  Image as ImageIcon,
  Check,
  Wand2,
  Type,
  Gift,
} from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';

export const AdminSettingsPage = () => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useToast();
  const { refreshCurrency } = useCurrency();
  const { refreshBranding, applyTheme } = useBrand();
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [confirmSettingsOpen, setConfirmSettingsOpen] = useState(false);
  const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);
  const heroImageInputRef = useRef(null);

  const [settings, setSettings] = useState({
    site_title: '',
    site_description: '',
    site_logo: '',
    site_favicon: '',
    theme_preset: 'cyber_teal',
    brand_primary_color: '#14b8a6',
    brand_secondary_color: '#06b6d4',
    hero_badge: 'Available for Remote Creative Contracts',
    hero_title: 'Creative Graphic Designer Helping Brands',
    hero_title_highlight: 'Stand Out & Sell Better.',
    hero_subtitle: 'Specializing in high-converting advertising creatives, memorable brand identities, e-commerce product design, and dynamic UGC video content.',
    hero_primary_btn_text: 'Explore My Portfolio',
    hero_primary_btn_link: '/portfolio',
    hero_secondary_btn_text: 'Book Discovery Call',
    hero_trust_badge_1: '3+ Years Experience',
    hero_trust_badge_2: 'Global Clients (USA, Dubai, BD)',
    hero_show_image: true,
    hero_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    hero_core_speciality: 'Branding • Ad Creatives • UI',
    hero_designer_name: 'Md Sakhawat Hossain',
    hero_designer_title: 'Creative Graphic Designer',
    hero_designer_status: 'Open to Work',
    hero_floating_top_val: '150+ Creatives',
    hero_floating_top_sub: 'High ROI Campaigns',
    hero_floating_bottom_val: '5.0 Star Rating',
    hero_floating_bottom_sub: '100% Client Praise',
    hero_years_exp: '5+',
    hero_projects_count: '150+',
    hero_client_satisfaction: '100%',
    portfolio_header_badge: 'Selected Portfolio Case Studies',
    portfolio_header_title: 'Creative Graphic Design Showcase',
    portfolio_header_subtitle: 'Explore commercial brand identities, high-converting social ad creatives, e-commerce product designs, and dynamic video edits.',
    currency_code: 'USD',
    currency_symbol: '$',
    currency_mode: 'DIRECT',
    usd_to_bdt_rate: 120,
    contact_email: 'designersakhawat@gmail.com',
    contact_phone: '',
    contact_location: '',
    bio_summary: '',
    social_links: {
      dribbble: '',
      behance: '',
      figma: '',
      github: '',
      linkedin: '',
      twitter: '',
    },
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Md Sakhawat Hossain',
    email: user?.email || 'admin@sakhawat.design',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          const d = res.data;
          let parsedSocial = {
            dribbble: '',
            behance: '',
            figma: '',
            github: '',
            linkedin: '',
            twitter: '',
          };

          if (d.social_links) {
            if (typeof d.social_links === 'object') {
              parsedSocial = { ...parsedSocial, ...d.social_links };
            } else if (typeof d.social_links === 'string') {
              try {
                parsedSocial = { ...parsedSocial, ...JSON.parse(d.social_links) };
              } catch (e) {}
            }
          }

          setSettings((prev) => ({
            ...prev,
            ...d,
            site_title: d.site_title || prev.site_title,
            site_description: d.site_description || prev.site_description,
            site_logo: d.site_logo || '',
            site_favicon: d.site_favicon || '',
            theme_preset: d.theme_preset || 'neon_lime',
            brand_primary_color: d.brand_primary_color || d.accent_color || '#ccff00',
            brand_secondary_color: d.brand_secondary_color || '#00f5d4',
            brand_button_text_mode: d.brand_button_text_mode || 'auto',
            hero_badge: d.hero_badge !== undefined ? d.hero_badge : prev.hero_badge,
            hero_title: d.hero_title !== undefined ? d.hero_title : prev.hero_title,
            hero_title_highlight: d.hero_title_highlight !== undefined ? d.hero_title_highlight : prev.hero_title_highlight,
            hero_subtitle: d.hero_subtitle !== undefined ? d.hero_subtitle : prev.hero_subtitle,
            hero_primary_btn_text: d.hero_primary_btn_text || prev.hero_primary_btn_text,
            hero_primary_btn_link: d.hero_primary_btn_link || prev.hero_primary_btn_link,
            hero_secondary_btn_text: d.hero_secondary_btn_text || prev.hero_secondary_btn_text,
            hero_trust_badge_1: d.hero_trust_badge_1 || prev.hero_trust_badge_1,
            hero_trust_badge_2: d.hero_trust_badge_2 || prev.hero_trust_badge_2,
            hero_show_image: d.hero_show_image !== undefined ? Boolean(d.hero_show_image) : prev.hero_show_image,
            hero_image: d.hero_image || prev.hero_image,
            hero_core_speciality: d.hero_core_speciality || prev.hero_core_speciality,
            hero_designer_name: d.hero_designer_name || d.designer_name || prev.hero_designer_name,
            hero_designer_title: d.hero_designer_title || d.designer_title || prev.hero_designer_title,
            hero_designer_status: d.hero_designer_status || prev.hero_designer_status,
            hero_floating_top_val: d.hero_floating_top_val || prev.hero_floating_top_val,
            hero_floating_top_sub: d.hero_floating_top_sub || prev.hero_floating_top_sub,
            hero_floating_bottom_val: d.hero_floating_bottom_val || prev.hero_floating_bottom_val,
            hero_floating_bottom_sub: d.hero_floating_bottom_sub || prev.hero_floating_bottom_sub,
            portfolio_header_badge: d.portfolio_header_badge !== undefined ? d.portfolio_header_badge : prev.portfolio_header_badge,
            portfolio_header_title: d.portfolio_header_title !== undefined ? d.portfolio_header_title : prev.portfolio_header_title,
            portfolio_header_subtitle: d.portfolio_header_subtitle !== undefined ? d.portfolio_header_subtitle : prev.portfolio_header_subtitle,
            currency_code: d.currency_code || 'USD',
            currency_symbol: d.currency_symbol || '$',
            currency_mode: d.currency_mode || 'DIRECT',
            usd_to_bdt_rate: Number(d.usd_to_bdt_rate) || 120,
            contact_email: d.contact_email || prev.contact_email,
            contact_phone: d.contact_phone || prev.contact_phone,
            contact_location: d.contact_location || prev.contact_location,
            bio_summary: d.bio_summary || prev.bio_summary,
            social_links: parsedSocial,
          }));
        }
      } catch (err) {
        console.error('Settings load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setConfirmSettingsOpen(true);
  };

  const executeSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        ...settings,
        designer_name: settings.hero_designer_name || settings.designer_name || 'Md Sakhawat Hossain',
        designer_title: settings.hero_designer_title || settings.designer_title || 'Creative Graphic Designer',
        designer_bio: settings.hero_subtitle || settings.bio_summary || '',
        accent_color: settings.brand_primary_color || '#ccff00',
        brand_primary_color: settings.brand_primary_color || '#ccff00',
        brand_secondary_color: settings.brand_secondary_color || '#00f5d4',
        brand_button_text_mode: settings.brand_button_text_mode || 'auto',
        theme_preset: settings.theme_preset || 'neon_lime',
        social_links: typeof settings.social_links === 'object' ? JSON.stringify(settings.social_links) : settings.social_links,
      };

      const res = await api.post('/settings/admin/bulk', { settings: payload });
      if (res.success) {
        localStorage.setItem('sakhawat_cached_settings', JSON.stringify(payload));
        localStorage.setItem(
          'sakhawat_cached_brand',
          JSON.stringify({
            site_logo: payload.site_logo || '',
            site_favicon: payload.site_favicon || '',
            brand_primary_color: payload.brand_primary_color,
            brand_secondary_color: payload.brand_secondary_color,
            brand_button_text_mode: payload.brand_button_text_mode,
            theme_preset: payload.theme_preset,
          })
        );
        // Clear all stale cache items so the homepage & other pages fetch fresh data immediately
        localStorage.removeItem('sakhawat_cached_homepage');
        localStorage.removeItem('sakhawat_cached_featured_projects');
        localStorage.removeItem('sakhawat_cached_services');
        localStorage.removeItem('sakhawat_cached_packages');
        localStorage.removeItem('sakhawat_cached_testimonials');
        localStorage.removeItem('sakhawat_cached_faqs');
        localStorage.removeItem('sakhawat_cached_brands');

        api.clearCache();
        applyGlobalThemeCSS(payload.brand_primary_color, payload.brand_secondary_color, payload.brand_button_text_mode);
        showToast('Site, branding & currency settings saved successfully! Live website updated instantly.', 'success');
        refreshCurrency?.();
        refreshBranding?.();
        window.dispatchEvent(new Event('currency-settings-changed'));
        window.dispatchEvent(new Event('branding-updated'));
        window.dispatchEvent(new Event('settings-updated'));
        setConfirmSettingsOpen(false);
      } else {
        showToast(res.message || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', 'Website Brand Logo');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setSettings((prev) => ({ ...prev, site_logo: res.data.fileUrl }));
        showToast('Brand logo uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Logo upload failed: ' + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', 'Site Favicon');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setSettings((prev) => ({ ...prev, site_favicon: res.data.fileUrl }));
        showToast('Favicon uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Favicon upload failed: ' + err.message, 'error');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroImage(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', 'Hero Showcase Photo');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setSettings((prev) => ({ ...prev, hero_image: res.data.fileUrl }));
        showToast('Hero showcase photo uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Hero image upload failed: ' + err.message, 'error');
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const applyThemePreset = (preset) => {
    setSettings((prev) => ({
      ...prev,
      theme_preset: preset.id,
      brand_primary_color: preset.primary,
      brand_secondary_color: preset.secondary,
    }));
    applyTheme(preset.primary, preset.secondary, settings.brand_button_text_mode || 'auto');
    showToast(`Theme switched to "${preset.name}". Click "Save All Site Settings" to persist.`, 'info');
  };

  const handleCustomColorChange = (key, value) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [key]: value,
        theme_preset: 'custom',
      };
      applyTheme(
        updated.brand_primary_color,
        updated.brand_secondary_color,
        updated.brand_button_text_mode || 'auto'
      );
      return updated;
    });
  };

  const handleButtonTextModeChange = (mode) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        brand_button_text_mode: mode,
      };
      applyTheme(
        updated.brand_primary_color,
        updated.brand_secondary_color,
        mode
      );
      return updated;
    });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setConfirmProfileOpen(true);
  };

  const executeSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        showToast('Admin profile and security credentials updated!', 'success');
        updateCurrentUser(res.data.user);
        setProfileData((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
        setConfirmProfileOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const applyCurrencyPreset = (code, symbol) => {
    setSettings((prev) => ({
      ...prev,
      currency_code: code,
      currency_symbol: symbol,
    }));
  };

  // Preview formatted price
  const samplePrice = 199;
  const previewFormatted =
    settings.currency_code === 'BDT' && settings.currency_mode === 'AUTO_CONVERT'
      ? `${settings.currency_symbol} ${Number(samplePrice * Number(settings.usd_to_bdt_rate || 120)).toLocaleString()}`
      : `${settings.currency_symbol} ${samplePrice.toLocaleString()}`;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Hidden Upload Inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />
      <input
        ref={faviconInputRef}
        type="file"
        accept="image/*"
        onChange={handleFaviconUpload}
        className="hidden"
      />
      <input
        ref={heroImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleHeroImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Site Settings & Configuration</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Manage dynamic website logo, favicon, color themes, hero headlines, currency symbol (USD / BDT), and admin credentials.
        </p>
      </div>

      {/* Global Content Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* BRAND IDENTITY & COLOR THEME CUSTOMIZER CARD */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-teal-500/40 bg-gradient-to-r from-teal-950/30 via-zinc-900/90 to-zinc-950/90 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                🎨 Brand Logo, Favicon & Website Theme Colors (ব্র্যান্ডিং ও কালার থিম)
              </h3>
              <p className="text-xs text-zinc-400">
                Change your website brand logo, browser favicon icon, and primary accent theme palette.
              </p>
            </div>
          </div>

          {/* Logo & Favicon Upload Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <label className="text-xs font-bold text-white block">
                Website Navbar Logo (ওয়েবসাইট লোগো)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.site_logo}
                  onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                  placeholder="e.g. /uploads/my-logo.png or https://..."
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  isLoading={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="cursor-pointer shrink-0"
                >
                  Upload
                </Button>
              </div>

              {settings.site_logo ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img
                    src={settings.site_logo}
                    alt="Logo preview"
                    className="h-9 max-h-9 w-auto object-contain rounded-lg"
                  />
                  <span className="text-[11px] text-emerald-400 font-mono">Active Logo Preview</span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400">
                  💡 লোগো খালি রাখলে স্বয়ংক্রিয়ভাবে আকর্ষণীয় <strong>"SH • Md Sakhawat Hossain"</strong> মার্ক দেখাবে।
                </p>
              )}
              <p className="text-[10px] text-teal-400">📐 রিকমেন্ডেড: 400 × 120 px (Transparent PNG বা SVG), 150 KB-এর নিচে</p>
            </div>

            {/* Favicon */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <label className="text-xs font-bold text-white block">
                Browser Tab Favicon (ব্রাউজার ট্যাব ফেভিকন)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.site_favicon}
                  onChange={(e) => setSettings({ ...settings, site_favicon: e.target.value })}
                  placeholder="e.g. /uploads/favicon.png or https://..."
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  isLoading={uploadingFavicon}
                  onClick={() => faviconInputRef.current?.click()}
                  className="cursor-pointer shrink-0"
                >
                  Upload
                </Button>
              </div>

              {settings.site_favicon ? (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                  <img
                    src={settings.site_favicon}
                    alt="Favicon preview"
                    className="w-6 h-6 object-contain rounded"
                  />
                  <span className="text-[11px] text-emerald-400 font-mono">Active Favicon Preview</span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400">
                  💡 ব্রাউজার ট্যাবে যে ছোট্ট আইকনটি প্রদর্শিত হবে।
                </p>
              )}
              <p className="text-[10px] text-teal-400">📐 রিকমেন্ডেড: 64 × 64 px (Square PNG / ICO), 50 KB-এর নিচে</p>
            </div>
          </div>

          {/* Theme Color Palettes */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-white block">
                  1-Click Curated Theme Palettes (ওয়েবসাইটের থিম কালার সিলেক্টর):
                </label>
                <span className="text-[11px] text-zinc-400">
                  যেকোনো প্যালেটে ক্লিক করলে সাইটের বাটন, গ্লো ও টেক্সট কালার সাথে সাথে লাইভ পরিবর্তিত হবে।
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected =
                  settings.brand_primary_color === preset.primary &&
                  settings.brand_secondary_color === preset.secondary;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyThemePreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800 border-teal-400 shadow-lg'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className="w-4 h-4 rounded-full shadow"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span
                        className="w-4 h-4 rounded-full shadow"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">{preset.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Smart 1st Color Selector & Auto 2nd Color Suggestion Engine */}
            <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI & Color Theory Auto-Match 2nd Color Engine</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    আপনার লোগোর ১ম কালার সিলেক্ট করলেই সিস্টেম স্বয়ংক্রিয়ভাবে সবচেয়ে মানানসই ২য় কালার সাজেস্ট করবে।
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Wand2}
                  onClick={() => {
                    const suggestions = getSuggestedSecondColors(settings.brand_primary_color);
                    if (suggestions && suggestions.length > 0) {
                      handleCustomColorChange('brand_secondary_color', suggestions[0].hex);
                      showToast(`Auto-matched secondary color to: ${suggestions[0].name}`, 'success');
                    }
                  }}
                  className="cursor-pointer font-semibold shrink-0"
                >
                  ✨ Auto-Match 2nd Color
                </Button>
              </div>

              {/* Quick 1st Color Swatches */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-2">
                  ১ম কালার কুইক পিক (লোগো ও পপুলার ব্র্যান্ড কালার):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: '🍋 Designer Sakhawat Neon Lime', hex: '#ccff00' },
                    { name: '🌊 Cyber Teal', hex: '#14b8a6' },
                    { name: '⚡ Electric Blue', hex: '#3b82f6' },
                    { name: '💜 Royal Violet', hex: '#8b5cf6' },
                    { name: '🌅 Sunset Amber', hex: '#f59e0b' },
                    { name: '🍃 Emerald Green', hex: '#10b981' },
                    { name: '🌸 Hot Magenta', hex: '#ec4899' },
                  ].map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => {
                        handleCustomColorChange('brand_primary_color', swatch.hex);
                        // Also auto-suggest matching second color
                        const suggestions = getSuggestedSecondColors(swatch.hex);
                        if (suggestions && suggestions.length > 0) {
                          handleCustomColorChange('brand_secondary_color', suggestions[0].hex);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        settings.brand_primary_color.toLowerCase() === swatch.hex.toLowerCase()
                          ? 'bg-zinc-800 border-white text-white shadow'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: swatch.hex }} />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 1st Primary Color Picker */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">1st Primary Brand Color</span>
                    <span className="text-[11px] text-zinc-400 block font-mono">{settings.brand_primary_color}</span>
                    <span className="text-[10px] text-teal-400">লোগোর মূল কালার বা প্রধান বাটন হাইলাইট</span>
                  </div>
                  <input
                    type="color"
                    value={settings.brand_primary_color}
                    onChange={(e) => {
                      handleCustomColorChange('brand_primary_color', e.target.value);
                      const suggestions = getSuggestedSecondColors(e.target.value);
                      if (suggestions && suggestions.length > 0) {
                        handleCustomColorChange('brand_secondary_color', suggestions[0].hex);
                      }
                    }}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                    title="Choose Primary Color"
                  />
                </div>

                {/* 2nd Secondary Color Picker */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">2nd Secondary Accent Glow</span>
                    <span className="text-[11px] text-zinc-400 block font-mono">{settings.brand_secondary_color}</span>
                    <span className="text-[10px] text-cyan-400">গ্রেডিয়েন্ট ফ্লো, গ্লো অ্যান্ড রিবন একসেন্ট</span>
                  </div>
                  <input
                    type="color"
                    value={settings.brand_secondary_color}
                    onChange={(e) => handleCustomColorChange('brand_secondary_color', e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                    title="Choose Secondary Color"
                  />
                </div>
              </div>

              {/* Dynamic Suggested 2nd Colors based on 1st Color */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-zinc-300 block mb-2">
                  🎨 Smart Suggested 2nd Colors (১ম কালারের সাথে সবচেয়ে সেরা ম্যাচ):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {getSuggestedSecondColors(settings.brand_primary_color).map((s, idx) => {
                    const isCurrentSecondary =
                      settings.brand_secondary_color.toLowerCase() === s.hex.toLowerCase();
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCustomColorChange('brand_secondary_color', s.hex)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                          isCurrentSecondary
                            ? 'bg-zinc-800 border-teal-400 shadow-md'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full shadow border border-white/20 shrink-0"
                            style={{ backgroundColor: s.hex }}
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{s.hex}</span>
                          </div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                          {s.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Button Text Contrast & Legibility Controller */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-teal-400" />
                      <span>Button Font & Contrast Color (বাটনের লেখার কালার ও স্পষ্টতা):</span>
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      নিয়ন লাইম বা হালকা কালারে লেখা ১০০% স্পষ্ট ও সুন্দর পড়ার জন্য অটো কন্ট্রাস্ট বা ডার্ক টেক্সট ব্যবহার করুন।
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'auto', label: '🤖 Auto Contrast (Recommended)' },
                      { id: 'dark', label: '⚫ Dark Text' },
                      { id: 'light', label: '⚪ White Text' },
                    ].map((mode) => {
                      const isActive = (settings.brand_button_text_mode || 'auto') === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleButtonTextModeChange(mode.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                            isActive
                              ? 'bg-zinc-800 border border-teal-400 text-white shadow'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div
                className="p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 mt-3"
                style={{
                  background: `linear-gradient(135deg, ${settings.brand_primary_color}18, ${settings.brand_secondary_color}18)`,
                  borderColor: `${settings.brand_primary_color}40`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${settings.brand_primary_color}, ${settings.brand_secondary_color})`,
                      color: getContrastTextColor(settings.brand_primary_color, settings.brand_button_text_mode || 'auto'),
                    }}
                  >
                    DS
                  </div>
                  <div>
                    <div
                      className="font-bold text-sm bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${settings.brand_primary_color}, ${settings.brand_secondary_color})`,
                      }}
                    >
                      Designer Sakhawat • Visual Brand Dynamic Flow
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      Primary: {settings.brand_primary_color} | Secondary: {settings.brand_secondary_color}
                    </span>
                  </div>
                </div>

                <div
                  className="px-5 py-2.5 rounded-xl text-xs font-black shadow-lg cursor-default transition-all tracking-wide"
                  style={{
                    backgroundColor: settings.brand_primary_color,
                    color: getContrastTextColor(
                      settings.brand_primary_color,
                      settings.brand_button_text_mode || 'auto'
                    ),
                    boxShadow: `0 10px 25px -5px ${settings.brand_primary_color}60`,
                  }}
                >
                  Live CTA Button Preview
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Price Sign Configuration Card */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-teal-500/40 bg-gradient-to-r from-teal-950/30 via-zinc-900/90 to-zinc-950/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  💰 Website Currency & Price Sign Settings (কারেন্সি ও প্রাইস সাইন)
                </h3>
                <p className="text-xs text-zinc-400">
                  Select whether your entire website displays prices in <strong>USD ($)</strong> or <strong>BDT (৳)</strong>.
                </p>
              </div>
            </div>

            {/* Live Preview Pill */}
            <div className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-teal-500/30 flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Live Preview ($199):</span>
              <span className="text-xs font-black text-teal-300 font-mono">{previewFormatted}</span>
            </div>
          </div>

          {/* Quick Currency Selector Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              1-Click Currency Selector (দ্রুত কারেন্সি নির্বাচন করুন):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => applyCurrencyPreset('USD', '$')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.currency_code === 'USD'
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🇺🇸</span>
                  <span className="text-xs font-black font-mono">$</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">USD ($)</div>
                <div className="text-[10px] text-zinc-400">US Dollar</div>
              </button>

              <button
                type="button"
                onClick={() => applyCurrencyPreset('BDT', '৳')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.currency_code === 'BDT'
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🇧🇩</span>
                  <span className="text-xs font-black font-mono">৳</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">BDT (৳)</div>
                <div className="text-[10px] text-zinc-400">Bangladeshi Taka</div>
              </button>

              <button
                type="button"
                onClick={() => applyCurrencyPreset('EUR', '€')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.currency_code === 'EUR'
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🇪🇺</span>
                  <span className="text-xs font-black font-mono">€</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">EUR (€)</div>
                <div className="text-[10px] text-zinc-400">Euro</div>
              </button>

              <button
                type="button"
                onClick={() => applyCurrencyPreset('GBP', '£')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.currency_code === 'GBP'
                    ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-950/50'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">🇬🇧</span>
                  <span className="text-xs font-black font-mono">£</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">GBP (£)</div>
                <div className="text-[10px] text-zinc-400">British Pound</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Currency Symbol (প্রাইস সাইন)
              </label>
              <input
                type="text"
                value={settings.currency_symbol}
                onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                placeholder="$, ৳, €, £"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Currency Code (ISO কোড)
              </label>
              <input
                type="text"
                value={settings.currency_code}
                onChange={(e) => setSettings({ ...settings, currency_code: e.target.value.toUpperCase() })}
                placeholder="USD, BDT, EUR"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Price Calculation Mode
              </label>
              <select
                value={settings.currency_mode || 'DIRECT'}
                onChange={(e) => setSettings({ ...settings, currency_mode: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="DIRECT">Direct Price (e.g. ৳199 or $199)</option>
                <option value="AUTO_CONVERT">Auto Convert USD to BDT (e.g. $199 × 120 = ৳23,880)</option>
              </select>
            </div>
          </div>

          {settings.currency_mode === 'AUTO_CONVERT' && (
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-teal-500/20 space-y-2">
              <label className="block text-xs font-semibold text-teal-300 mb-1">
                USD to BDT Exchange Rate (১ ডলারে কত টাকা)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-mono">$1.00 USD =</span>
                <input
                  type="number"
                  step="0.1"
                  value={settings.usd_to_bdt_rate}
                  onChange={(e) => setSettings({ ...settings, usd_to_bdt_rate: e.target.value })}
                  placeholder="120"
                  className="w-32 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-400 font-mono"
                />
                <span className="text-xs text-zinc-400 font-mono">BDT (৳)</span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            EXIT-INTENT POP-UP MODAL & FREE VOUCHER CUSTOMIZER CARD
            ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-zinc-900/90 to-zinc-950/90 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  🎁 Exit-Intent Pop-up Modal & Free Voucher Customizer (লিভ পপ-আপ এডিটর)
                </h3>
                <p className="text-xs text-zinc-400">
                  Manage the exit-intent popup headline, discount voucher amount ({settings.currency_symbol}), bullet points, and button text.
                </p>
              </div>
            </div>

            {/* Toggle Enable/Disable Exit Intent */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white cursor-pointer hover:border-amber-400 transition-colors shrink-0">
              <input
                type="checkbox"
                checked={settings.exit_intent_enabled !== false}
                onChange={(e) => setSettings({ ...settings, exit_intent_enabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 accent-amber-500"
              />
              <span className="font-semibold">Enable Exit-Intent Pop-up</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Voucher Credit Discount ({settings.currency_code} {settings.currency_symbol}) *
              </label>
              <input
                type="number"
                value={settings.exit_intent_voucher_amount !== undefined ? settings.exit_intent_voucher_amount : 50}
                onChange={(e) => setSettings({ ...settings, exit_intent_voucher_amount: Number(e.target.value) || 0 })}
                placeholder="50"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-300"
              />
              <span className="text-[11px] text-zinc-500 block mt-1">
                যেমন ৫০ ডলার বা ৫০০ টাকা। এটি পপ-আপে {settings.currency_symbol}{settings.exit_intent_voucher_amount || 50} হিসেবে অটোমেটিক বসে যাবে।
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Top Badge Tag
              </label>
              <input
                type="text"
                value={settings.exit_intent_badge || "WAIT! DON'T LEAVE EMPTY HANDED"}
                onChange={(e) => setSettings({ ...settings, exit_intent_badge: e.target.value })}
                placeholder="WAIT! DON'T LEAVE EMPTY HANDED"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Highlighted Headline Keyword
              </label>
              <input
                type="text"
                value={settings.exit_intent_title_highlight || 'Free 5-Point Design Audit'}
                onChange={(e) => setSettings({ ...settings, exit_intent_title_highlight: e.target.value })}
                placeholder="Free 5-Point Design Audit"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-400 font-semibold text-teal-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Headline Title (Use &#123;highlight&#125; and &#123;voucher&#125; placeholders)
              </label>
              <input
                type="text"
                value={settings.exit_intent_title || 'Get a {highlight} + {voucher} OFF Your First Project!'}
                onChange={(e) => setSettings({ ...settings, exit_intent_title: e.target.value })}
                placeholder="Get a {highlight} + {voucher} OFF Your First Project!"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Pitch Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={settings.exit_intent_subtitle || 'Let Sakhawat personally analyze your current ad creatives, logo, or landing page and reveal how to boost your conversion rates.'}
              onChange={(e) => setSettings({ ...settings, exit_intent_subtitle: e.target.value })}
              placeholder="Explain the offer value clearly..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Offer Bullet Point 1
              </label>
              <input
                type="text"
                value={settings.exit_intent_feature_1 || 'Free Video Screen-Share Audit (No Obligation)'}
                onChange={(e) => setSettings({ ...settings, exit_intent_feature_1: e.target.value })}
                placeholder="Free Video Screen-Share Audit (No Obligation)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Offer Bullet Point 2 (Use &#123;voucher&#125; placeholder)
              </label>
              <input
                type="text"
                value={settings.exit_intent_feature_2 || '{voucher} Credit Instant Voucher towards any package'}
                onChange={(e) => setSettings({ ...settings, exit_intent_feature_2: e.target.value })}
                placeholder="{voucher} Credit Instant Voucher towards any package"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                CTA Submit Button Text
              </label>
              <input
                type="text"
                value={settings.exit_intent_btn_text || 'Claim My Free Audit & {voucher} Voucher'}
                onChange={(e) => setSettings({ ...settings, exit_intent_btn_text: e.target.value })}
                placeholder="Claim My Free Audit & {voucher} Voucher"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Privacy / Trust Guarantee Footer
              </label>
              <input
                type="text"
                value={settings.exit_intent_footer || '100% Privacy Protected • Zero spam ever'}
                onChange={(e) => setSettings({ ...settings, exit_intent_footer: e.target.value })}
                placeholder="100% Privacy Protected • Zero spam ever"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              👀 Live Pop-up Preview (আপনার বর্তমান কারেন্সিতে কেমন দেখাবে):
            </span>
            <div className="p-5 rounded-2xl bg-[#0e131b] border-2 border-teal-500/50 space-y-3 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold uppercase">
                <Gift className="w-3 h-3 text-amber-400" />
                <span>{settings.exit_intent_badge || "WAIT! DON'T LEAVE EMPTY HANDED"}</span>
              </div>
              <h4 className="text-base font-black text-white leading-snug">
                Get a <span className="text-teal-300 font-black">{settings.exit_intent_title_highlight || 'Free 5-Point Design Audit'}</span> + {settings.currency_symbol}{settings.exit_intent_voucher_amount || 50} OFF Your First Project!
              </h4>
              <p className="text-xs text-zinc-300">
                {settings.exit_intent_subtitle}
              </p>
              <div className="space-y-1 text-xs text-teal-300 font-semibold p-2.5 rounded-xl bg-zinc-900/80">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{settings.exit_intent_feature_1 || 'Free Video Screen-Share Audit (No Obligation)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{(settings.exit_intent_feature_2 || '{voucher} Credit Instant Voucher').replace('{voucher}', `${settings.currency_symbol}${settings.exit_intent_voucher_amount || 50}`)}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-lime-400 text-zinc-950 text-center font-black text-xs">
                {(settings.exit_intent_btn_text || 'Claim My Free Audit & {voucher} Voucher').replace('{voucher}', `${settings.currency_symbol}${settings.exit_intent_voucher_amount || 50}`)} →
              </div>
            </div>
          </div>
        </div>

        {/* HOMEPAGE HERO SECTION & PHOTO CUSTOMIZER CARD */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-teal-500/40 bg-gradient-to-r from-teal-950/30 via-zinc-900/90 to-zinc-950/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  🚀 Homepage Hero Section, Photo & Text Customizer (হিরো সেকশন ও ছবি এডিটর)
                </h3>
                <p className="text-xs text-zinc-400">
                  Manage headline, subtitle, buttons, badges, and upload/change/remove your showcase photo.
                </p>
              </div>
            </div>

            {/* Toggle Show/Hide Image Column */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white cursor-pointer hover:border-teal-400 transition-colors shrink-0">
              <input
                type="checkbox"
                checked={settings.hero_show_image !== false}
                onChange={(e) => setSettings({ ...settings, hero_show_image: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 bg-zinc-950 border-zinc-700 accent-teal-500"
              />
              <span className="font-semibold">Show Hero Image Showcase</span>
            </label>
          </div>

          {/* Hero Image / Photo Upload, Preview & Removal */}
          {settings.hero_show_image !== false && (
            <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-teal-400" />
                  <span>Hero Showcase Photo (আপনার প্রোফাইল / মডেল ফটো)</span>
                </label>
                {settings.hero_image && (
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, hero_image: '' })}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Clear / Remove Photo
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Live Preview Box */}
                <div className="w-24 h-30 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden relative shrink-0 shadow-lg flex items-center justify-center">
                  {settings.hero_image ? (
                    <img
                      src={settings.hero_image}
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-zinc-500 text-center px-1">No Image Selected</span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.hero_image || ''}
                      onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                      placeholder="e.g. /uploads/sakhawat.png or https://..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-400 font-mono"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={Upload}
                      isLoading={uploadingHeroImage}
                      onClick={() => heroImageInputRef.current?.click()}
                      className="cursor-pointer font-bold shrink-0"
                    >
                      Upload New Photo
                    </Button>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    💡 সরাসরি আপনার কম্পিউটার থেকে পাসপোর্ট বা পোর্ট্রেট ছবি আপলোড করুন অথবা যেকোনো ইমেজ লিঙ্ক পেস্ট করুন।
                  </p>
                </div>
              </div>

              {/* Photo Overlay Tag Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-900">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                    Top Speciality Pill:
                  </label>
                  <input
                    type="text"
                    value={settings.hero_core_speciality || ''}
                    onChange={(e) => setSettings({ ...settings, hero_core_speciality: e.target.value })}
                    placeholder="Branding • Ad Creatives • UI"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                    Designer Name Tag:
                  </label>
                  <input
                    type="text"
                    value={settings.hero_designer_name || ''}
                    onChange={(e) => setSettings({ ...settings, hero_designer_name: e.target.value })}
                    placeholder="Md Sakhawat Hossain"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                    Designer Title Tag:
                  </label>
                  <input
                    type="text"
                    value={settings.hero_designer_title || ''}
                    onChange={(e) => setSettings({ ...settings, hero_designer_title: e.target.value })}
                    placeholder="Creative Graphic Designer"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Floating Stat Badges on Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-teal-400 block">Top-Right Floating Stat:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={settings.hero_floating_top_val || ''}
                      onChange={(e) => setSettings({ ...settings, hero_floating_top_val: e.target.value })}
                      placeholder="150+ Creatives"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      value={settings.hero_floating_top_sub || ''}
                      onChange={(e) => setSettings({ ...settings, hero_floating_top_sub: e.target.value })}
                      placeholder="High ROI Campaigns"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-400"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 block">Bottom-Left Floating Stat:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={settings.hero_floating_bottom_val || ''}
                      onChange={(e) => setSettings({ ...settings, hero_floating_bottom_val: e.target.value })}
                      placeholder="5.0 Star Rating"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      value={settings.hero_floating_bottom_sub || ''}
                      onChange={(e) => setSettings({ ...settings, hero_floating_bottom_sub: e.target.value })}
                      placeholder="100% Client Praise"
                      className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Headline & Description Texts */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Main Headline (হিরো টাইটেল) *
                </label>
                <input
                  type="text"
                  value={settings.hero_title || ''}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  placeholder="Creative Graphic Designer Helping Brands"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-teal-400 mb-1.5">
                  Gradient Highlight Line *
                </label>
                <input
                  type="text"
                  value={settings.hero_title_highlight || ''}
                  onChange={(e) => setSettings({ ...settings, hero_title_highlight: e.target.value })}
                  placeholder="Stand Out & Sell Better."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-teal-300 font-bold text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Availability Badge Text (উপরে থাকা সবুজ নোটিশ)
              </label>
              <input
                type="text"
                value={settings.hero_badge || ''}
                onChange={(e) => setSettings({ ...settings, hero_badge: e.target.value })}
                placeholder="Available for Remote Creative Contracts"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Hero Subtitle / Description (বিস্তারিত বিবরণ)
              </label>
              <textarea
                rows={3}
                value={settings.hero_subtitle || ''}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                placeholder="Specializing in high-converting advertising creatives, memorable brand identities..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Buttons & Badges Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={settings.hero_primary_btn_text || 'Explore My Portfolio'}
                  onChange={(e) => setSettings({ ...settings, hero_primary_btn_text: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={settings.hero_secondary_btn_text || 'Book Discovery Call'}
                  onChange={(e) => setSettings({ ...settings, hero_secondary_btn_text: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Trust Badge 1
                </label>
                <input
                  type="text"
                  value={settings.hero_trust_badge_1 || '3+ Years Experience'}
                  onChange={(e) => setSettings({ ...settings, hero_trust_badge_1: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Trust Badge 2
                </label>
                <input
                  type="text"
                  value={settings.hero_trust_badge_2 || 'Global Clients (USA, Dubai, BD)'}
                  onChange={(e) => setSettings({ ...settings, hero_trust_badge_2: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Page Header Customizer */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Palette className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Portfolio Page Header (পোর্টফোলিও পেজের লেখা)
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-teal-400 mb-1.5">
                Top Badge Text
              </label>
              <input
                type="text"
                value={settings.portfolio_header_badge || ''}
                onChange={(e) => setSettings({ ...settings, portfolio_header_badge: e.target.value })}
                placeholder="Selected Portfolio Case Studies"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Main Headline (পোর্টফোলিও টাইটেল)
              </label>
              <input
                type="text"
                value={settings.portfolio_header_title || ''}
                onChange={(e) => setSettings({ ...settings, portfolio_header_title: e.target.value })}
                placeholder="Creative Graphic Design Showcase"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Subtitle / Description
              </label>
              <textarea
                rows={2}
                value={settings.portfolio_header_subtitle || ''}
                onChange={(e) => setSettings({ ...settings, portfolio_header_subtitle: e.target.value })}
                placeholder="Explore commercial brand identities, high-converting social ad creatives..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Contact & Notifications */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Mail className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Contact & Notification Routing
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Inquiry Notification Target *
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="designersakhawat@gmail.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Location & Availability
              </label>
              <input
                type="text"
                value={settings.contact_location}
                onChange={(e) => setSettings({ ...settings, contact_location: e.target.value })}
                placeholder="Dhaka, Bangladesh • Worldwide Remote"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Save Global Settings Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            isLoading={savingSettings}
          >
            Save All Site Settings
          </Button>
        </div>
      </form>

      {/* Admin Profile & Password Security Form */}
      <form onSubmit={handleUpdateProfile} className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Lock className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Admin Profile & Security Credentials
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Admin Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Admin Login Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-zinc-800/60">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Current Password (Required for password changes)
            </label>
            <input
              type="password"
              value={profileData.currentPassword}
              onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              value={profileData.newPassword}
              onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="secondary"
            size="md"
            icon={Save}
            isLoading={savingProfile}
          >
            Update Admin Credentials
          </Button>
        </div>
      </form>

      {/* Confirmation Modal for Site & Currency Settings Save */}
      <ConfirmDialog
        isOpen={confirmSettingsOpen}
        onClose={() => setConfirmSettingsOpen(false)}
        onConfirm={executeSaveSettings}
        title="Confirm Site, Branding & Currency Settings Save"
        message="Are you sure you want to apply these brand logo, favicon, theme colors, and currency configurations live to the website?"
        confirmText="Yes, Save Settings"
        cancelText="Review Again"
        isLoading={savingSettings}
        variant="primary"
      />

      {/* Confirmation Modal for Admin Profile & Password Update */}
      <ConfirmDialog
        isOpen={confirmProfileOpen}
        onClose={() => setConfirmProfileOpen(false)}
        onConfirm={executeSaveProfile}
        title="Confirm Admin Security Profile Update"
        message="Are you sure you want to update your admin credentials (name, email or password)?"
        confirmText="Yes, Update Credentials"
        cancelText="Cancel"
        isLoading={savingProfile}
        variant="warning"
      />
    </div>
  );
};

export default AdminSettingsPage;
