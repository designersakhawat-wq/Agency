import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calculator,
  Check,
  ArrowRight,
  Zap,
  Clock,
  Gift,
  ShieldCheck,
  TrendingUp,
  Percent,
  MessageCircle,
  Calendar,
  X,
  User,
  Building,
  FileText,
  Send,
  Plus,
  Minus,
  CheckCircle2,
  Info,
} from 'lucide-react';
import Button from '../common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';
import tracking from '../../services/trackingService';

const DEFAULT_CONFIG = {
  badge: 'Instant Project Scope & Price Calculator',
  title: 'Calculate Your Project Cost & Get Instant Quote',
  subtitle:
    'Select your design service and quantity below to see the exact price and send your customized project quote directly to WhatsApp in 1 click.',
  discount_percent: 15,
  roi_multiplier_min: 3.2,
  roi_multiplier_max: 5.5,
  turnaround_standard_label: 'Standard Delivery (3–5 Days)',
  turnaround_standard_sub: 'Regular schedule • Normal fee',
  turnaround_rush_label: 'Express Rush (24–48 Hours)',
  turnaround_rush_sub: '+35% priority surge • Fastest queue',
  turnaround_rush_multiplier: 1.35,
  cta_button_text: 'Send Quote to WhatsApp',
  guarantee_text: '100% Free Consultation • Direct reply within 5 mins',
  whatsapp_number: '8801781955355',
  services: [
    {
      id: 'ads',
      name: 'Social Media & Ad Creatives',
      basePrice: 45,
      unitLabel: 'Creatives',
      min: 3,
      max: 30,
      icon: '🎯',
      presets: [3, 5, 10, 20],
    },
    {
      id: 'branding',
      name: 'Logo & Brand Identity',
      basePrice: 280,
      unitLabel: 'Brand Assets',
      min: 1,
      max: 6,
      icon: '🎨',
      presets: [1, 2, 3, 5],
    },
    {
      id: 'packaging',
      name: 'Product Packaging & 3D Mockup',
      basePrice: 120,
      unitLabel: 'Packaging SKUs',
      min: 1,
      max: 10,
      icon: '📦',
      presets: [1, 2, 4, 6],
    },
    {
      id: 'banner',
      name: 'High-Impact Banner & Hero Web Ads',
      basePrice: 60,
      unitLabel: 'Banner Sizes',
      min: 2,
      max: 15,
      icon: '🚀',
      presets: [2, 4, 6, 10],
    },
  ],
  addons: [
    { id: 'source_files', name: 'Editable Master Files (PSD / AI / Figma)', price: 40 },
    { id: 'fast_revisions', name: 'Unlimited Priority Revision Rounds (7-Day)', price: 60 },
    { id: 'animated_motion', name: 'Animated Video / Motion Graphics Version', price: 95 },
  ],
};

export const InteractiveProjectEstimator = ({ onOpenBooking }) => {
  const { formatAmount } = useCurrency();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [serviceType, setServiceType] = useState('ads');
  const [quantity, setQuantity] = useState(5);
  const [turnaround, setTurnaround] = useState('standard');
  const [selectedAddons, setSelectedAddons] = useState(['source_files']);
  const [discountClaimed, setDiscountClaimed] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('8801781955355');

  // WhatsApp Quote Dispatch Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          if (res.data.contact_whatsapp || res.data.contact_phone) {
            const raw = String(res.data.contact_whatsapp || res.data.contact_phone).replace(/[^\d]/g, '');
            const formatted = raw.startsWith('88') ? raw : `88${raw}`;
            setWhatsappNumber(formatted);
          }

          if (res.data.estimator_config) {
            let parsed = res.data.estimator_config;
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch (e) {
                parsed = DEFAULT_CONFIG;
              }
            }
            const merged = {
              ...DEFAULT_CONFIG,
              ...parsed,
              services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : DEFAULT_CONFIG.services,
              addons: Array.isArray(parsed.addons) && parsed.addons.length > 0 ? parsed.addons : DEFAULT_CONFIG.addons,
            };
            setConfig(merged);
            if (merged.services.length > 0 && !merged.services.find((s) => s.id === serviceType)) {
              setServiceType(merged.services[0].id);
              setQuantity(merged.services[0].min || 1);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load estimator config:', err);
      }
    };

    fetchConfig();
  }, []);

  const serviceOptions = config.services || DEFAULT_CONFIG.services;
  const currentService = serviceOptions.find((s) => s.id === serviceType) || serviceOptions[0] || {
    basePrice: 50,
    unitLabel: 'Units',
    min: 1,
    max: 10,
    name: 'Service',
    presets: [1, 3, 5, 10],
  };

  const addonsList = config.addons || DEFAULT_CONFIG.addons;

  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Turnaround multipliers
  const rushMultiplier = Number(config.turnaround_rush_multiplier) || 1.35;
  const turnaroundMultiplier = turnaround === 'rush' ? rushMultiplier : 1.0;

  // Calculation
  const baseServiceCost = (Number(currentService.basePrice) || 0) * quantity;
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const addon = addonsList.find((a) => a.id === addonId);
    return acc + (addon ? Number(addon.price) || 0 : 0);
  }, 0);

  const subtotal = Math.round((baseServiceCost + addonsTotal) * turnaroundMultiplier);
  const discountPct = (Number(config.discount_percent) || 15) / 100;
  const discountAmount = discountClaimed ? Math.round(subtotal * discountPct) : 0;
  const finalTotal = subtotal - discountAmount;

  // ROI / Value multiplier
  const roiMin = Number(config.roi_multiplier_min) || 3.2;
  const roiMax = Number(config.roi_multiplier_max) || 5.5;
  const estimatedValueMin = Math.round(finalTotal * roiMin);
  const estimatedValueMax = Math.round(finalTotal * roiMax);

  const handleClaimDiscount = () => {
    if (!discountClaimed) {
      setDiscountClaimed(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#06b6d4', '#f59e0b', '#ffffff'],
      });
    }
  };

  const handleOpenQuoteModal = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#14b8a6', '#06b6d4', '#10b981'],
    });
    tracking.trackEstimateQuote(currentService.name, finalTotal, 'USD');
    setQuoteModalOpen(true);
  };

  const handleSendToWhatsApp = () => {
    const cleanPhone = (whatsappNumber || '01781955355').replace(/[^\d]/g, '');
    const finalPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

    const selectedAddonObjs = selectedAddons
      .map((id) => addonsList.find((a) => a.id === id))
      .filter(Boolean);

    tracking.trackWhatsAppClick(
      'Estimator Quote Modal',
      'Instant Quote Booking',
      `${currentService.name} (${quantity} units) - ${formatAmount(finalTotal)}`
    );

    let msg = `🎯 *NEW PROJECT ESTIMATE QUOTE* 🎯\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (clientName.trim()) msg += `👤 *Client Name:* ${clientName.trim()}\n`;
    if (companyName.trim()) msg += `🏢 *Company / Brand:* ${companyName.trim()}\n`;
    msg += `💼 *Design Service:* ${currentService.name}\n`;
    msg += `🔢 *Quantity / Scope:* ${quantity} ${currentService.unitLabel || 'Units'}\n`;
    msg += `⏱️ *Delivery Speed:* ${turnaround === 'rush' ? 'Express Rush (24–48 Hours)' : 'Standard (3–5 Days)'}\n`;

    if (selectedAddonObjs.length > 0) {
      msg += `📦 *Add-ons Included:*\n`;
      selectedAddonObjs.forEach((a) => {
        msg += `   • ${a.name} (+${formatAmount(a.price)})\n`;
      });
    }

    if (discountClaimed) {
      msg += `🎁 *Discount Voucher:* ${config.discount_percent || 15}% Welcome Voucher Applied (-${formatAmount(discountAmount)})\n`;
    }

    msg += `💰 *Total Estimated Quote:* ${formatAmount(finalTotal)}\n`;
    msg += `📈 *Projected Campaign Impact:* ${formatAmount(estimatedValueMin)} – ${formatAmount(estimatedValueMax)}+\n`;

    if (projectNotes.trim()) {
      msg += `📝 *Project Details / Requirements:* ${projectNotes.trim()}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💬 *Message:* Hi Sakhawat! I customized this project quote on your website and would like to confirm details and get started. Are you available?`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${finalPhone}?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setQuoteModalOpen(false);
  };

  const handleBookMeetingDirect = () => {
    setQuoteModalOpen(false);
    const quoteSummary = `${currentService.name} (${quantity} ${currentService.unitLabel || 'Units'}) - Est. ${formatAmount(finalTotal)}`;
    if (onOpenBooking) {
      onOpenBooking(quoteSummary);
    }
  };

  const presets = currentService.presets || [currentService.min || 1, 3, 5, 10];

  return (
    <section id="estimator-section" className="py-20 sm:py-28 relative overflow-hidden bg-[#07070a] border-t border-zinc-800/80">
      {/* Ambient background glows */}
      <div className="ambient-glow-teal top-1/4 -right-20 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-10 -left-20 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ========================================================================= */}
        {/* 1. CLEAR & INTUITIVE HEADER WITH 3-STEP GUIDE                             */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-950/40">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span>{config.badge || 'Instant Project Cost Calculator'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            {config.title || 'Calculate Your Project Cost in 30 Seconds'}
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {config.subtitle || 'Select what you need below to see the exact price and send a customized quote directly to WhatsApp in 1 click.'}
          </p>

          {/* 3-Step Human Process Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 font-black text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                1
              </span>
              <span className="text-xs font-bold text-zinc-200">1. Choose Service</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 font-black text-xs flex items-center justify-center shrink-0 border border-teal-500/30">
                2
              </span>
              <span className="text-xs font-bold text-zinc-200">2. Select Quantity</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/30">
                3
              </span>
              <span className="text-xs font-bold text-emerald-300">3. Get WhatsApp Quote</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TWO-COLUMN LAYOUT: CONFIGURATOR (LEFT) + LIVE PRICE CARD (RIGHT)       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: STEP BY STEP SELECTIONS */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: CHOOSE SERVICE */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500 text-zinc-950 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  Select Design Service (সার্ভিস সিলেক্ট করুন)
                </span>
                <span className="text-[11px] text-zinc-400">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceOptions.map((opt) => {
                  const isSelected = serviceType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setServiceType(opt.id);
                        setQuantity(Math.max(opt.min || 1, Math.min(quantity, opt.max || 10)));
                      }}
                      className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer relative ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-400 shadow-lg shadow-teal-950/40 text-white ring-1 ring-teal-400/40'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{opt.icon || '🎯'}</span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-teal-400 text-zinc-950 flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800" />
                        )}
                      </div>
                      <p className="text-sm font-bold font-display text-white">{opt.name}</p>
                      <p className="text-[11px] text-teal-400 font-semibold mt-1">
                        Starts at {formatAmount(opt.basePrice)} / {(opt.unitLabel || 'unit').toLowerCase().split(' ')[0]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: QUANTITY WITH PRESETS & STEPPER */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500 text-zinc-950 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  Select Quantity (কতটি ডিজাইন প্রয়োজন?)
                </span>
                <span className="text-[11px] text-zinc-400">Step 2 of 3</span>
              </div>

              {/* Quick Presets for Instant One-Tap Pick */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-zinc-400 block">
                  Quick Select Presets:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {presets.map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuantity(val)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        quantity === val
                          ? 'bg-teal-400 text-zinc-950 border-teal-300 shadow-md shadow-teal-950/40 scale-102 font-black'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {val} {currentService.unitLabel ? currentService.unitLabel.split(' ')[0] : 'Items'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stepper + Custom Counter */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-zinc-400 block">Custom Amount:</span>
                  <span className="text-xl sm:text-2xl font-black font-display text-white">
                    {quantity} {currentService.unitLabel || 'Units'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max((currentService.min || 1), quantity - 1))}
                    disabled={quantity <= (currentService.min || 1)}
                    className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white flex items-center justify-center border border-zinc-700 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-12 text-center text-lg font-bold font-mono text-teal-300">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(Math.min((currentService.max || 30), quantity + 1))}
                    disabled={quantity >= (currentService.max || 30)}
                    className="w-10 h-10 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-zinc-950 font-bold flex items-center justify-center transition-colors cursor-pointer shadow-md"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Fine Slider */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min={currentService.min || 1}
                  max={currentService.max || 30}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Min: {currentService.min || 1}</span>
                  <span>Max: {currentService.max || 30}</span>
                </div>
              </div>
            </div>

            {/* STEP 3: TURNAROUND SPEED & ADD-ONS */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-500 text-zinc-950 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  Delivery Speed & Optional Add-ons
                </span>
                <span className="text-[11px] text-zinc-400">Step 3 of 3</span>
              </div>

              {/* Delivery Speed Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setTurnaround('standard')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    turnaround === 'standard'
                      ? 'bg-teal-500/15 border-teal-400 text-white ring-1 ring-teal-400/40'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span>{config.turnaround_standard_label || 'Standard (3–5 Days)'}</span>
                    </span>
                    {turnaround === 'standard' && <Check className="w-4 h-4 text-teal-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {config.turnaround_standard_sub || 'Regular schedule • Normal price'}
                  </p>
                </button>

                <button
                  onClick={() => setTurnaround('rush')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    turnaround === 'rush'
                      ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400/40 shadow-lg shadow-amber-950/20'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>{config.turnaround_rush_label || 'Express Rush (24–48 Hours)'}</span>
                    </span>
                    {turnaround === 'rush' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {config.turnaround_rush_sub || '+35% priority surge • Fastest queue'}
                  </p>
                </button>
              </div>

              {/* Optional Addons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-zinc-400 block">
                  Optional Add-ons (প্রয়োজন হলে সিলেক্ট করুন):
                </span>
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-zinc-800/90 border-teal-500/50 text-white'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-xs">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                            isChecked
                              ? 'bg-teal-500 border-teal-400 text-zinc-950'
                              : 'border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-teal-400 font-mono">+{formatAmount(addon.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: LIVE PRICE CALCULATION & WHATSAPP ACTION */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="rounded-3xl glass-panel p-6 sm:p-8 border-2 border-teal-500/40 bg-zinc-950/95 shadow-2xl shadow-teal-950/40 space-y-6 relative card-shine">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                    Instant Price Calculation
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Guaranteed Rate
                </span>
              </div>

              {/* Total Estimated Price Display */}
              <div className="space-y-1.5">
                <span className="text-xs text-zinc-400 block font-medium">
                  Total Estimated Investment:
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight">
                    {formatAmount(finalTotal)}
                  </span>
                  {discountClaimed && (
                    <span className="text-lg sm:text-xl text-zinc-500 line-through font-bold">
                      {formatAmount(subtotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Itemized Breakdown Box */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>{currentService.name} ({quantity}x)</span>
                  <span className="font-mono font-bold text-white">{formatAmount(baseServiceCost)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Delivery Speed</span>
                  <span>{turnaround === 'rush' ? 'Express Rush (+35%)' : 'Standard'}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="flex items-center justify-between text-zinc-300">
                    <span>Add-ons Total</span>
                    <span className="font-mono text-teal-400">+{formatAmount(addonsTotal)}</span>
                  </div>
                )}
                {discountClaimed && (
                  <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-zinc-800">
                    <span>First-Client Voucher ({config.discount_percent || 15}%)</span>
                    <span>-{formatAmount(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Special Discount Voucher Button */}
              {!discountClaimed ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
                  <div>
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-400" />
                      Special {config.discount_percent || 15}% Welcome Voucher
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Save {formatAmount(Math.round(subtotal * discountPct))} instantly
                    </p>
                  </div>
                  <button
                    onClick={handleClaimDiscount}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-md hover:scale-105 transition-all cursor-pointer shrink-0"
                  >
                    Claim 15%
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{config.discount_percent || 15}% Discount Voucher Active!</span>
                </div>
              )}

              {/* Primary Direct WhatsApp Quote Action Button */}
              <div className="space-y-3 pt-1">
                <button
                  onClick={handleOpenQuoteModal}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-emerald-950/60 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Send Quote to WhatsApp →</span>
                </button>

                <p className="text-[11px] text-center text-zinc-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{config.guarantee_text || '100% Free Consultation • Direct reply within 5 mins'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          🎯 WHATSAPP QUOTE CONFIRMATION & DISPATCH MODAL
          ========================================================================= */}
      <AnimatePresence>
        {quoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuoteModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-3xl glass-card border-2 border-teal-500/40 bg-zinc-950/95 p-6 sm:p-8 shadow-2xl shadow-teal-950/60 z-10 space-y-6 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Send Quote to WhatsApp</span>
                </div>
                <h3 className="text-2xl font-display font-black text-white">
                  Confirm & Send Project Quote
                </h3>
                <p className="text-xs text-zinc-400">
                  This will open WhatsApp with your customized scope and quote details ready to send.
                </p>
              </div>

              {/* Quote Summary Pill */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">{currentService.name}</span>
                  <span className="font-bold text-white">{quantity} {currentService.unitLabel || 'Units'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Delivery Speed:</span>
                  <span className="text-white font-medium">{turnaround === 'rush' ? 'Express (24–48h)' : 'Standard (3–5 Days)'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-sm">
                  <span className="font-bold text-teal-400">Total Price Estimate:</span>
                  <span className="text-xl font-black font-display text-white">{formatAmount(finalTotal)}</span>
                </div>
              </div>

              {/* Client Info Form (Optional for personalized message) */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Your Name (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sakhawat Hossain"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Company / Brand Name (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Studio"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleSendToWhatsApp}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Open WhatsApp & Send Details</span>
                </button>

                <button
                  onClick={handleBookMeetingDirect}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-teal-400" />
                  <span>Or Schedule a 1-on-1 Discovery Meeting Instead</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InteractiveProjectEstimator;
