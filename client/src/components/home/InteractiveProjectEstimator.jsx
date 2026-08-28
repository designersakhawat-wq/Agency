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
} from 'lucide-react';
import Button from '../common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';

const DEFAULT_CONFIG = {
  badge: 'Instant Project Scope & Budget Calculator',
  title: 'Calculate Your Custom Project Cost & Turnaround',
  subtitle:
    'Select your design deliverables below for an instant transparent price quote and turnaround estimate with zero obligation.',
  discount_percent: 15,
  roi_multiplier_min: 3.2,
  roi_multiplier_max: 5.5,
  turnaround_standard_label: 'Standard (3–5 Days)',
  turnaround_standard_sub: 'Regular schedule',
  turnaround_rush_label: 'Express Rush (24–48 Hours)',
  turnaround_rush_sub: '+35% priority surge',
  turnaround_rush_multiplier: 1.35,
  cta_button_text: 'Lock In This Project Quote',
  guarantee_text: 'Includes free consultation call & revision rights',
  whatsapp_number: '8801781955355',
  services: [
    {
      id: 'ads',
      name: 'Social Media & Ad Creatives',
      basePrice: 45,
      unitLabel: 'Creatives',
      min: 3,
      max: 20,
      icon: '🎯',
    },
    {
      id: 'branding',
      name: 'Logo & Brand Identity',
      basePrice: 280,
      unitLabel: 'Brand Assets / Variations',
      min: 1,
      max: 5,
      icon: '🎨',
    },
    {
      id: 'packaging',
      name: 'Product Packaging & 3D Mockup',
      basePrice: 120,
      unitLabel: 'Packaging SKUs',
      min: 1,
      max: 8,
      icon: '📦',
    },
    {
      id: 'banner',
      name: 'High-Impact Banner & Hero Web Ads',
      basePrice: 60,
      unitLabel: 'Banner Sizes',
      min: 2,
      max: 12,
      icon: '🚀',
    },
  ],
  addons: [
    { id: 'source_files', name: 'Editable Source Files (PSD/AI/Figma)', price: 40 },
    { id: 'fast_revisions', name: 'Unlimited Priority Revisions (7-Day)', price: 60 },
    { id: 'animated_motion', name: 'Animated Video / Motion Version (MP4)', price: 95 },
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
  const baseTotal = (Number(currentService.basePrice) || 0) * quantity;
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const addon = addonsList.find((a) => a.id === addonId);
    return acc + (addon ? Number(addon.price) || 0 : 0);
  }, 0);

  const subtotal = Math.round((baseTotal + addonsTotal) * turnaroundMultiplier);
  const discountPct = (Number(config.discount_percent) || 15) / 100;
  const discountAmount = discountClaimed ? Math.round(subtotal * discountPct) : 0;
  const finalTotal = subtotal - discountAmount;

  // Estimated ROI / Value multiplier
  const roiMin = Number(config.roi_multiplier_min) || 3.2;
  const roiMax = Number(config.roi_multiplier_max) || 5.5;
  const estimatedValueMin = Math.round(finalTotal * roiMin);
  const estimatedValueMax = Math.round(finalTotal * roiMax);

  const handleClaimDiscount = () => {
    if (!discountClaimed) {
      setDiscountClaimed(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#06b6d4', '#f59e0b', '#ffffff'],
      });
    }
  };

  const handleOpenQuoteModal = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#14b8a6', '#06b6d4', '#10b981'],
    });
    setQuoteModalOpen(true);
  };

  // Generate complete structured WhatsApp message and open WhatsApp
  const handleSendToWhatsApp = () => {
    const cleanPhone = (whatsappNumber || '01781955355').replace(/[^\d]/g, '');
    const finalPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

    const selectedAddonObjs = selectedAddons
      .map((id) => addonsList.find((a) => a.id === id))
      .filter(Boolean);

    let msg = `🎯 *NEW PROJECT ESTIMATE QUOTE* 🎯\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    if (clientName.trim()) msg += `👤 *Client Name:* ${clientName.trim()}\n`;
    if (companyName.trim()) msg += `🏢 *Company / Brand:* ${companyName.trim()}\n`;
    msg += `💼 *Design Service:* ${currentService.name}\n`;
    msg += `🔢 *Volume / Scope:* ${quantity} ${currentService.unitLabel || 'Units'}\n`;
    msg += `⏱️ *Turnaround:* ${turnaround === 'rush' ? (config.turnaround_rush_label || 'Express Rush (24–48h)') : (config.turnaround_standard_label || 'Standard (3–5 Days)')}\n`;

    if (selectedAddonObjs.length > 0) {
      msg += `📦 *Add-ons Selected:*\n`;
      selectedAddonObjs.forEach((a) => {
        msg += `   • ${a.name} (+${formatAmount(a.price)})\n`;
      });
    }

    if (discountClaimed) {
      msg += `🎁 *Discount Voucher:* ${config.discount_percent || 15}% First-Client Voucher Applied (-${formatAmount(discountAmount)})\n`;
    }

    msg += `💰 *Total Estimated Quote:* ${formatAmount(finalTotal)}\n`;
    msg += `📈 *Projected Campaign ROI:* ${formatAmount(estimatedValueMin)} – ${formatAmount(estimatedValueMax)}+\n`;

    if (projectNotes.trim()) {
      msg += `📝 *Project Scope / Timeline:* ${projectNotes.trim()}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💬 *Message:* Hi Sakhawat! I customized this project quote on your website estimator and would like to lock in this estimate and get started. Are you available?`;

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

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-zinc-950/60 via-zinc-900/40 to-zinc-950/80 border-t border-zinc-800/80">
      {/* Ambient background glows */}
      <div className="ambient-glow-teal top-1/4 -right-20 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-10 -left-20 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-teal-950/40">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span>{config.badge || 'Interactive Cost & ROI Calculator'}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            {config.title || 'Calculate Your Custom Project & ROI in 60s'}
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mt-3 font-light leading-relaxed">
            {config.subtitle ||
              'Select your requirements below to see an instant transparent price quote and lock in an exclusive discount voucher.'}
          </p>
        </motion.div>

        {/* Interactive Estimator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step Configurator (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Service */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-4">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px]">
                  1
                </span>
                Choose Design Service
              </span>

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
                          ? 'bg-teal-500/15 border-teal-500/60 shadow-lg shadow-teal-950/30 text-white'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{opt.icon || '🎯'}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold font-display text-white">{opt.name}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Starts at {formatAmount(opt.basePrice)} / {(opt.unitLabel || 'unit').toLowerCase().split(' ')[0]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Quantity Slider */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px]">
                    2
                  </span>
                  Select Volume ({currentService.unitLabel || 'Units'})
                </span>
                <span className="font-display font-black text-2xl text-white px-3 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {quantity}
                </span>
              </div>

              <input
                type="range"
                min={currentService.min || 1}
                max={currentService.max || 10}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />

              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Min: {currentService.min || 1}</span>
                <span>Max: {currentService.max || 10}</span>
              </div>
            </div>

            {/* Step 3: Turnaround & Add-ons */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-5">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[11px]">
                  3
                </span>
                Turnaround Speed & Optional Add-ons
              </span>

              {/* Speed Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTurnaround('standard')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    turnaround === 'standard'
                      ? 'bg-teal-500/15 border-teal-500/50 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>{config.turnaround_standard_label || 'Standard (3–5 Days)'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {config.turnaround_standard_sub || 'Regular schedule'}
                  </p>
                </button>

                <button
                  onClick={() => setTurnaround('rush')}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    turnaround === 'rush'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-950/20'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>{config.turnaround_rush_label || 'Express Rush (24–48 Hours)'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {config.turnaround_rush_sub || '+35% priority surge'}
                  </p>
                </button>
              </div>

              {/* Addons Checklist */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-zinc-400">Recommended Enhancements:</p>
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-zinc-800/80 border-teal-500/40 text-white'
                          : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-teal-500 border-teal-400 text-white'
                              : 'border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-teal-400">+{formatAmount(addon.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Quote & Conversion Card (Right 5 Cols) */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="rounded-3xl glass-panel p-6 sm:p-8 border-2 border-teal-500/50 shadow-2xl shadow-teal-950/40 space-y-6 relative card-shine">
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
                  Live Price Estimate
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Instant Guaranteed
                </span>
              </div>

              {/* Price Display */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight">
                    {formatAmount(finalTotal)}
                  </span>
                  {discountClaimed && (
                    <span className="text-lg sm:text-xl text-zinc-500 line-through font-bold">
                      {formatAmount(subtotal)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  Transparent fixed cost • No hidden charges • 100% satisfaction guarantee
                </p>
              </div>

              {/* ROI Projected Benefit */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  <span>Projected Campaign ROI & Impact:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Estimated brand revenue / ad lift value generated:{' '}
                  <strong className="text-white font-bold">{formatAmount(estimatedValueMin)} – {formatAmount(estimatedValueMax)}+</strong>
                </p>
              </div>

              {/* Discount Voucher Box */}
              {!discountClaimed ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-400" />
                      Special {config.discount_percent || 15}% First-Client Voucher
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Save {formatAmount(Math.round(subtotal * discountPct))} on this order
                    </p>
                  </div>
                  <button
                    onClick={handleClaimDiscount}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Claim {config.discount_percent || 15}%
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 font-bold">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  <span>
                    {config.discount_percent || 15}% Welcome Discount Applied (-{formatAmount(discountAmount)})!
                  </span>
                </div>
              )}

              {/* Primary Action Button: Lock In Quote & Dispatch to WhatsApp */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-black text-base shadow-xl shadow-teal-950/60 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-zinc-950 cursor-pointer"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={handleOpenQuoteModal}
                >
                  {config.cta_button_text || 'Lock In This Project Quote'}
                </Button>

                <p className="text-[11px] text-center text-zinc-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{config.guarantee_text || 'Includes free consultation call & revision rights'}</span>
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuoteModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-teal-500/40 p-6 sm:p-7 shadow-2xl shadow-teal-950/50 space-y-5 overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Instant WhatsApp Confirmation</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Lock In Your Custom Project Quote
                </h3>
                <p className="text-xs text-zinc-400">
                  Your customized scope is ready. Send it directly to Sakhawat's WhatsApp for priority scheduling and instant confirmation.
                </p>
              </div>

              {/* Quote Breakdown Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <span className="font-semibold text-zinc-400">🎨 Chosen Service:</span>
                  <span className="font-bold text-white text-right">{currentService.name}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <span className="font-semibold text-zinc-400">🔢 Scope / Volume:</span>
                  <span className="font-bold text-teal-300">{quantity} {currentService.unitLabel || 'Units'}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <span className="font-semibold text-zinc-400">⏱️ Turnaround:</span>
                  <span className="font-bold text-white">
                    {turnaround === 'rush' ? (config.turnaround_rush_label || 'Express Rush (24–48h)') : (config.turnaround_standard_label || 'Standard (3–5 Days)')}
                  </span>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="flex items-start justify-between pb-2 border-b border-zinc-800/80 gap-2">
                    <span className="font-semibold text-zinc-400">📦 Add-ons:</span>
                    <span className="font-medium text-zinc-200 text-right">
                      {selectedAddons.map((id) => addonsList.find((a) => a.id === id)?.name).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {discountClaimed && (
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-emerald-400">
                    <span className="font-semibold">🎁 Voucher Discount:</span>
                    <span className="font-bold font-mono">-{formatAmount(discountAmount)} ({config.discount_percent || 15}% OFF)</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-sm font-black">
                  <span className="text-white">💰 Total Estimated Quote:</span>
                  <span className="text-teal-400 font-mono text-base">{formatAmount(finalTotal)}</span>
                </div>
              </div>

              {/* Optional Client Details Fields */}
              <div className="space-y-3 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Your Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Sarah Rahman"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Brand / Business Name (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Apex Digital"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Project Notes / Deadline (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      placeholder="Brief details or target launch date..."
                      value={projectNotes}
                      onChange={(e) => setProjectNotes(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Send via WhatsApp (Instant & Pre-filled) */}
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Send Quote to WhatsApp (Instant Reply)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Alternative: Book Video Call */}
                <button
                  type="button"
                  onClick={handleBookMeetingDirect}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>Or Schedule a Free 1-on-1 Consultation Call</span>
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

