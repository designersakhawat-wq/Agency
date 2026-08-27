import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const BrandContext = createContext(null);

export const THEME_PRESETS = [
  {
    id: 'neon_lime',
    name: '🍋 Neon Lime & Electric Cyan (Designer Sakhawat Logo Match)',
    primary: '#ccff00',
    secondary: '#00f5d4',
    bgGlow: 'rgba(204, 255, 0, 0.25)',
  },
  {
    id: 'cyber_teal',
    name: '🌊 Cyber Teal & Cyan (Default)',
    primary: '#14b8a6',
    secondary: '#06b6d4',
    bgGlow: 'rgba(20, 184, 166, 0.25)',
  },
  {
    id: 'royal_purple',
    name: '💜 Royal Violet & Fuchsia',
    primary: '#8b5cf6',
    secondary: '#d946ef',
    bgGlow: 'rgba(139, 92, 246, 0.25)',
  },
  {
    id: 'electric_blue',
    name: '⚡ Electric Blue & Indigo',
    primary: '#3b82f6',
    secondary: '#6366f1',
    bgGlow: 'rgba(59, 130, 246, 0.25)',
  },
  {
    id: 'sunset_gold',
    name: '🌅 Sunset Amber & Coral Crimson',
    primary: '#f59e0b',
    secondary: '#ef4444',
    bgGlow: 'rgba(245, 158, 11, 0.25)',
  },
  {
    id: 'emerald_matrix',
    name: '🍃 Emerald Matrix Green',
    primary: '#10b981',
    secondary: '#059669',
    bgGlow: 'rgba(16, 185, 129, 0.25)',
  },
];

export const hexToRgb = (hex) => {
  if (!hex || typeof hex !== 'string') return '20, 184, 166';
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return '20, 184, 166';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
};

export const hexToHsl = (hex) => {
  let clean = (hex || '#14b8a6').replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  let r = parseInt(clean.substring(0, 2), 16) / 255;
  let g = parseInt(clean.substring(2, 4), 16) / 255;
  let b = parseInt(clean.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

export const hslToHex = (h, s, l) => {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
};

/**
 * WCAG Relative Luminance Contrast Calculator:
 * Returns dark text (#09090b) for bright neon colors (e.g. Neon Lime, Yellow, Cyan)
 * and white text (#ffffff) for darker colors.
 */
export const getContrastTextColor = (hexColor, mode = 'auto') => {
  if (mode === 'dark') return '#09090b';
  if (mode === 'light') return '#ffffff';

  if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
  let clean = hexColor.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#ffffff';

  // WCAG relative luminance formula
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 0.52 ? '#09090b' : '#ffffff';
};

/**
 * Intelligent Color Harmony Engine:
 * Generates smart, high-converting matching secondary colors based on the 1st primary color
 */
export const getSuggestedSecondColors = (primaryHex) => {
  const { h, s, l } = hexToHsl(primaryHex);

  // If primary is neon yellow-green (like #ccff00, h ≈ 70)
  if (h >= 50 && h <= 95) {
    return [
      { name: '⚡ Electric Cyan Glow (Recommended)', hex: '#00f5d4', tag: 'Best Match' },
      { name: '💎 Cyber Sky Blue', hex: '#06b6d4', tag: 'High Contrast' },
      { name: '🍃 Vivid Emerald', hex: '#10b981', tag: 'Harmonious' },
      { name: '💜 Royal Purple (Vibrant Contrast)', hex: '#a855f7', tag: 'Complementary' },
      { name: '🔥 Sunset Amber', hex: '#f59e0b', tag: 'Warm Accent' },
    ];
  }

  return [
    {
      name: '⚡ Analogous Shift (Recommended)',
      hex: hslToHex(h + 35, Math.min(s + 10, 95), Math.max(l - 5, 45)),
      tag: 'Best Match',
    },
    {
      name: '💎 Electric Cyan / Ice Accent',
      hex: hslToHex(h + 55, 95, 50),
      tag: 'High Energy',
    },
    {
      name: '💜 Complementary Contrast',
      hex: hslToHex(h + 180, 90, 55),
      tag: 'Bold Duo',
    },
    {
      name: '🍃 Tonal Deep Flow',
      hex: hslToHex(h + 20, 90, 38),
      tag: 'Smooth Blend',
    },
    {
      name: '🔥 Sunset Gold Shift',
      hex: hslToHex(h - 35, 95, 52),
      tag: 'Warm Glow',
    },
  ];
};

export const applyGlobalThemeCSS = (prim, sec, textMode = 'auto') => {
  const root = document.documentElement;
  const primary = prim || '#14b8a6';
  const secondary = sec || '#06b6d4';
  const rgbPrim = hexToRgb(primary);
  const rgbSec = hexToRgb(secondary);
  const contrastText = getContrastTextColor(primary, textMode);

  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-secondary', secondary);
  root.style.setProperty('--brand-primary-rgb', rgbPrim);
  root.style.setProperty('--brand-secondary-rgb', rgbSec);
  root.style.setProperty('--brand-glow', `rgba(${rgbPrim}, 0.25)`);
  root.style.setProperty('--brand-text-on-primary', contrastText);
};

const getInitialBrandState = () => {
  try {
    const raw = localStorage.getItem('sakhawat_cached_brand') || localStorage.getItem('sakhawat_cached_settings');
    if (raw) {
      const d = JSON.parse(raw);
      const pColor = d.brand_primary_color || d.accent_color || '#ccff00';
      const sColor = d.brand_secondary_color || '#00f5d4';
      const bTextMode = d.brand_button_text_mode || 'auto';
      applyGlobalThemeCSS(pColor, sColor, bTextMode);
      return {
        siteLogo: d.site_logo || '',
        siteFavicon: d.site_favicon || '',
        primaryColor: pColor,
        secondaryColor: sColor,
        themePreset: d.theme_preset || 'neon_lime',
        buttonTextMode: bTextMode,
      };
    }
  } catch (e) {}

  applyGlobalThemeCSS('#ccff00', '#00f5d4', 'auto');
  return {
    siteLogo: '',
    siteFavicon: '',
    primaryColor: '#ccff00',
    secondaryColor: '#00f5d4',
    themePreset: 'neon_lime',
    buttonTextMode: 'auto',
  };
};

export const BrandProvider = ({ children }) => {
  const initial = getInitialBrandState();
  const [siteLogo, setSiteLogo] = useState(initial.siteLogo);
  const [siteFavicon, setSiteFavicon] = useState(initial.siteFavicon);
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initial.secondaryColor);
  const [themePreset, setThemePreset] = useState(initial.themePreset);
  const [buttonTextMode, setButtonTextMode] = useState(initial.buttonTextMode);
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('sakhawat_cached_settings');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });
  const [loading, setLoading] = useState(false);

  const fetchBrandSettings = async (force = false) => {
    try {
      const res = await api.get('/settings', {}, { forceRefresh: force });
      if (res.success && res.data) {
        const d = res.data;
        setSettings(d);
        if (d.site_logo) setSiteLogo(d.site_logo);
        if (d.site_favicon) {
          setSiteFavicon(d.site_favicon);
          updateFavicon(d.site_favicon);
        }
        const pColor = d.brand_primary_color || d.accent_color || '#ccff00';
        const sColor = d.brand_secondary_color || '#00f5d4';
        const bTextMode = d.brand_button_text_mode || 'auto';
        const preset = d.theme_preset || 'neon_lime';

        setPrimaryColor(pColor);
        setSecondaryColor(sColor);
        setButtonTextMode(bTextMode);
        setThemePreset(preset);

        applyGlobalThemeCSS(pColor, sColor, bTextMode);
        updateDocumentMeta(d);

        // Cache brand settings locally for 0ms instant load
        localStorage.setItem(
          'sakhawat_cached_brand',
          JSON.stringify({
            site_logo: d.site_logo || '',
            site_favicon: d.site_favicon || '',
            site_title: d.site_title || '',
            site_description: d.site_description || '',
            designer_name: d.designer_name || 'Md Sakhawat Hossain',
            designer_title: d.designer_title || 'Creative Graphic Designer',
            brand_primary_color: pColor,
            brand_secondary_color: sColor,
            brand_button_text_mode: bTextMode,
            theme_preset: preset,
          })
        );
      }
    } catch (err) {
      console.error('Failed to load branding settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentMeta = (data) => {
    if (!data) return;
    const name = data.designer_name || data.hero_designer_name || 'Md Sakhawat Hossain';
    const title = data.designer_title || data.hero_designer_title || 'Creative Graphic Designer';
    const siteTitle = data.site_title || `${name} — ${title}`;

    document.title = siteTitle;

    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc && (data.site_description || data.hero_subtitle)) {
      metaDesc.content = data.site_description || data.hero_subtitle;
    }
    const ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) {
      ogTitle.content = siteTitle;
    }
  };

  const updateFavicon = (url) => {
    if (!url) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
  };

  useEffect(() => {
    fetchBrandSettings();
  }, []);

  return (
    <BrandContext.Provider
      value={{
        siteLogo,
        siteFavicon,
        primaryColor,
        secondaryColor,
        themePreset,
        buttonTextMode,
        settings,
        applyTheme: (p, s, tm = 'auto') => {
          setPrimaryColor(p);
          setSecondaryColor(s);
          setButtonTextMode(tm);
          applyGlobalThemeCSS(p, s, tm);
          localStorage.setItem(
            'sakhawat_cached_brand',
            JSON.stringify({
              site_logo: siteLogo,
              site_favicon: siteFavicon,
              brand_primary_color: p,
              brand_secondary_color: s,
              brand_button_text_mode: tm,
            })
          );
        },
        refreshBranding: (force = true) => fetchBrandSettings(force),
        loading,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    return {
      siteLogo: '',
      siteFavicon: '',
      primaryColor: '#14b8a6',
      secondaryColor: '#06b6d4',
      themePreset: 'cyber_teal',
      buttonTextMode: 'auto',
      settings: {},
      applyTheme: (p, s, tm = 'auto') => applyGlobalThemeCSS(p, s, tm),
      refreshBranding: () => {},
      loading: false,
    };
  }
  return context;
};

export default BrandContext;
