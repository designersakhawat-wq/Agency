import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [currencyMode, setCurrencyMode] = useState('DIRECT'); // DIRECT | AUTO_CONVERT
  const [usdToBdtRate, setUsdToBdtRate] = useState(120);
  const [loading, setLoading] = useState(true);

  // Fetch settings from API
  const fetchCurrencySettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        const d = res.data;
        if (d.currency_symbol) setCurrencySymbol(d.currency_symbol);
        if (d.currency_code) setCurrencyCode(d.currency_code);
        if (d.currency_mode) setCurrencyMode(d.currency_mode);
        if (d.usd_to_bdt_rate) setUsdToBdtRate(Number(d.usd_to_bdt_rate) || 120);
      }
    } catch (e) {
      console.error('Failed to load currency settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencySettings();
  }, []);

  /**
   * Helper function to format any number/price amount
   * @param {number|string} amount
   * @param {object} options
   */
  const formatAmount = (amount, options = {}) => {
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
    // Fallback if not inside Provider
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
