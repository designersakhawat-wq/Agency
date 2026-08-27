import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // Read initial cached currency settings to prevent initial $ flash
  const getInitialState = () => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        const code = parsed.currency_code || 'USD';
        const sym = (parsed.currency_symbol && parsed.currency_symbol !== '?') ? parsed.currency_symbol : (code === 'BDT' ? '৳' : '$');
        return {
          symbol: sym,
          code: code,
          mode: parsed.currency_mode || 'DIRECT',
          rate: Number(parsed.usd_to_bdt_rate) || 120,
        };
      }
    } catch (e) {}
    return { symbol: '৳', code: 'BDT', mode: 'DIRECT', rate: 120 };
  };

  const initial = getInitialState();
  const [currencySymbol, setCurrencySymbol] = useState(initial.symbol);
  const [currencyCode, setCurrencyCode] = useState(initial.code);
  const [currencyMode, setCurrencyMode] = useState(initial.mode); // DIRECT | AUTO_CONVERT
  const [usdToBdtRate, setUsdToBdtRate] = useState(initial.rate);
  const [loading, setLoading] = useState(false);

  // Fetch settings from API and update state & local cache
  const fetchCurrencySettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res && res.success && res.data) {
        const d = res.data;
        const code = d.currency_code || 'BDT';
        const sym = (d.currency_symbol && d.currency_symbol !== '?') ? d.currency_symbol : (code === 'BDT' ? '৳' : '$');
        const mode = d.currency_mode || 'DIRECT';
        const rate = Number(d.usd_to_bdt_rate) || 120;

        setCurrencySymbol(sym);
        setCurrencyCode(code);
        setCurrencyMode(mode);
        setUsdToBdtRate(rate);

        // Update cached settings
        try {
          const cached = localStorage.getItem('sakhawat_cached_settings');
          const prev = cached ? JSON.parse(cached) : {};
          localStorage.setItem(
            'sakhawat_cached_settings',
            JSON.stringify({ ...prev, ...d, currency_symbol: sym, currency_code: code, currency_mode: mode, usd_to_bdt_rate: rate })
          );
        } catch (e) {}
      }
    } catch (e) {
      console.error('Failed to load currency settings:', e);
    }
  }, []);

  useEffect(() => {
    fetchCurrencySettings();

    // Listen to custom currency update event
    const handleCurrencyEvent = () => {
      fetchCurrencySettings();
    };

    window.addEventListener('currency-settings-changed', handleCurrencyEvent);
    window.addEventListener('storage', handleCurrencyEvent);

    return () => {
      window.removeEventListener('currency-settings-changed', handleCurrencyEvent);
      window.removeEventListener('storage', handleCurrencyEvent);
    };
  }, [fetchCurrencySettings]);

  /**
   * Helper function to format any number/price amount throughout the site
   * @param {number|string} amount
   * @param {object} options
   */
  const formatAmount = (amount, options = {}) => {
    if (amount === undefined || amount === null || amount === '') return `${currencySymbol}0`;
    const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

    let finalAmount = numeric;
    if (currencyCode === 'BDT' && currencyMode === 'AUTO_CONVERT') {
      finalAmount = Math.round(numeric * usdToBdtRate);
    }

    const formattedNumber = Number(finalAmount).toLocaleString();
    const prefix = options.hideSymbol ? '' : currencySymbol;

    return `${prefix}${formattedNumber}`;
  };

  const setCurrency = (code, symbol, mode = 'DIRECT', rate = 120) => {
    setCurrencyCode(code);
    setCurrencySymbol(symbol);
    setCurrencyMode(mode);
    setUsdToBdtRate(rate);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencySymbol,
        currencyCode,
        currencyMode,
        usdToBdtRate,
        formatAmount,
        setCurrency,
        refreshCurrency: fetchCurrencySettings,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currencySymbol: '$',
      currencyCode: 'USD',
      currencyMode: 'DIRECT',
      usdToBdtRate: 120,
      formatAmount: (amount) => `$${Number(amount || 0).toLocaleString()}`,
      setCurrency: () => {},
      refreshCurrency: () => {},
      loading: false,
    };
  }
  return context;
};

export default CurrencyContext;
