import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calculator,
  Check,
  Zap,
  Clock,
  Gift,
  ShieldCheck,
  MessageCircle,
  Calendar,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Button from '../common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../services/api';
import tracking from '../../services/trackingService';

// Built-in clean defaults with sensible bounds & distinct presets
const DEFAULT_SERVICES = [
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
    unitLabel: 'Brand Concepts',
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
];

const DEFAULT_ADDONS = [
  { id: 'source_files', name: 'Editable Source Files (PSD / AI / Figma)', price: 40 },
  { id: 'fast_revisions', name: 'Unlimited Priority Revisions (7-Day)', price: 60 },
  { id: 'animated_motion', name: 'Animated Video / Motion Reels Version', price: 95 },
];

export const InteractiveProjectEstimator = ({ onOpenBooking }) => {
  const { formatAmount } = useCurrency();
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [addons, setAddons] = useState(DEFAULT_ADDONS);
  const [serviceType, setServiceType] = useState('ads');
  const [quantity, setQuantity] = useState(5);
  const [turnaround, setTurnaround] = useState('standard');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [discountClaimed, setDiscountClaimed] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('8801781955355');

  // WhatsApp Quote Dispatch Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [projectNotes, setProjectNotes] = useState('');

  // Fetch settings from API with fallback
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
                parsed = null;
              }
            }
            if (parsed && Array.isArray(parsed.services) && parsed.services.length > 0) {
              setServices(parsed.services);
            }
            if (parsed && Array.isArray(parsed.addons) && parsed.addons.length > 0) {
              setAddons(parsed.addons);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load estimator config:', err);
      }
    };

    fetchConfig();
  }, []);

  // Find active service
  const currentService = useMemo(() => {
    return services.find((s) => s.id === serviceType) || services[0] || DEFAULT_SERVICES[0];
  }, [services, serviceType]);

  // Ensure quantity stays within valid range when service changes
  useEffect(() => {
    const min = currentService.min || 1;
    const max = currentService.max || 30;
    setQuantity((prev) => Math.max(min, Math.min(prev, max)));
  }, [currentService]);

  // Clean, strictly unique preset list
  const activePresets = useMemo(() => {
    if (Array.isArray(currentService.presets) && currentService.presets.length > 0) {
      return Array.from(new Set(currentService.presets));
    }
    const min = currentService.min || 1;
    const max = currentService.max || 10;
    if (min === 1 && max <= 6) return [1, 2, 3, 5];
    if (min >= 2 && max <= 15) return [2, 4, 6, 10];
    return [3, 5, 10, 20];
  }, [currentService]);

  const toggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Turnaround multiplier
  const turnaroundMultiplier = turnaround === 'rush' ? 1.35 : 1.0;

  // Live calculation
  const baseServiceCost = (Number(currentService.basePrice) || 0) * quantity;
  const addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    return acc + (addon ? Number(addon.price) || 0 : 0);
  }, 0);

  const subtotal = Math.round((baseServiceCost + addonsTotal) * turnaroundMultiplier);
  const discountAmount = discountClaimed ? Math.round(subtotal * 0.15) : 0;
  const finalTotal = subtotal - discountAmount;

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
      .map((id) => addons.find((a) => a.id === id))
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
      msg += `🎁 *Discount Voucher:* 15% Welcome Voucher Applied (-${formatAmount(discountAmount)})\n`;
    }

    msg += `💰 *Total Estimated Quote:* ${formatAmount(finalTotal)}\n`;

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

  return (
    <section
      id="estimator-section"
      className="py-20 sm:py-28 relative overflow-hidden transition-colors duration-300 border-t border-slate-200 dark:border-zinc-800/80"
    >
      {/* Background Glows */}
      <div className="ambient-glow-teal top-1/4 -right-20 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-10 -left-20 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ========================================================================= */}
        {/* 1. HEADER                                                                 */}
        {/* ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-teal-400" />
            <span>Interactive Cost Calculator</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight">
            Calculate Your Project Cost
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400">
            Select your design service and volume to see instant transparent pricing, then send to WhatsApp in 1 click.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. BALANCED 2-COLUMN STUDIO ESTIMATOR                                      */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: SERVICE & QUANTITY SELECTION */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: SERVICE TILES */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-4 bg-zinc-950/70">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-400 text-zinc-950 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  Select Design Service
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((opt) => {
                  const isSelected = serviceType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setServiceType(opt.id);
                        setQuantity(opt.min || 1);
                      }}
                      className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-400 text-white shadow-lg shadow-teal-950/50 ring-1 ring-teal-400/40'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{opt.icon || '🎯'}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-teal-400 text-zinc-950 font-black' : 'border border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">{opt.name}</p>
                        <p className="text-[11px] text-teal-400 font-semibold mt-0.5">
                          Starts at {formatAmount(opt.basePrice)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: QUANTITY CONTROLLER (CLEAN HERO STEPPER + UNIQUE PRESETS) */}
            <div className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800/90 shadow-xl space-y-5 bg-zinc-950/70">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-400 text-zinc-950 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  Select Deliverables Volume
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Step 2 of 2</span>
              </div>

              {/* Large Interactive Stepper Counter */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-zinc-400 block font-medium">Selected Quantity:</span>
                  <span className="text-2xl sm:text-3xl font-black font-display text-white">
                    {quantity} <span className="text-sm font-semibold text-teal-400">{currentService.unitLabel || 'Units'}</span>
                  </span>
                </div>

                {/* Stepper Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(currentService.min || 1, prev - 1))}
                    disabled={quantity <= (currentService.min || 1)}
                    className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white flex items-center justify-center border border-zinc-700 transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-10 text-center text-lg font-black font-mono text-teal-300">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity((prev) => Math.min(currentService.max || 30, prev + 1))}
                    disabled={quantity >= (currentService.max || 30)}
                    className="w-11 h-11 rounded-2xl bg-teal-400 hover:bg-teal-300 disabled:opacity-30 text-zinc-950 font-black flex items-center justify-center transition-colors cursor-pointer shadow-md"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Unique Presets Row */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 block">
                  Quick Select:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {activePresets.map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuantity(val)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        quantity === val
                          ? 'bg-teal-400 text-zinc-950 border-teal-300 shadow-md font-black scale-102'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {val} {currentService.unitLabel ? currentService.unitLabel.split(' ')[0] : 'Units'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Bar */}
              <div className="space-y-1 pt-1">
                <input
                  type="range"
                  min={currentService.min || 1}
                  max={currentService.max || 30}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Min: {currentService.min || 1}</span>
                  <span>Max: {currentService.max || 30}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: RECEIPT SUMMARY + SPEED/ADDONS + DIRECT WHATSAPP ACTION */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="rounded-3xl glass-panel p-6 sm:p-7 border-2 border-teal-500/40 bg-zinc-950/95 shadow-2xl shadow-teal-950/50 space-y-5 relative">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Live Estimate
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Fixed Rate
                </span>
              </div>

              {/* Total Price */}
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block font-medium">
                  Total Investment Quote:
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
                    {formatAmount(finalTotal)}
                  </span>
                  {discountClaimed && (
                    <span className="text-lg text-zinc-500 line-through font-bold">
                      {formatAmount(subtotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Itemized Breakdown Receipt */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs">
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
                    <span>Welcome Discount (15%)</span>
                    <span>-{formatAmount(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* 🎯 DELIVERY SPEED & ENHANCEMENTS (MOVED RIGHT ABOVE WHATSAPP CTA)          */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-1 border-t border-zinc-800/80">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block">
                  Delivery Speed & Enhancements:
                </span>

                {/* Speed Switcher */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTurnaround('standard')}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      turnaround === 'standard'
                        ? 'bg-teal-500/15 border-teal-400 text-white ring-1 ring-teal-400/40'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>Standard</span>
                      </span>
                      {turnaround === 'standard' && <Check className="w-3 h-3 text-teal-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400">3–5 Days • Regular</p>
                  </button>

                  <button
                    onClick={() => setTurnaround('rush')}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      turnaround === 'rush'
                        ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400/40'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Express Rush</span>
                      </span>
                      {turnaround === 'rush' && <Check className="w-3 h-3 text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400">24–48h • +35%</p>
                  </button>
                </div>

                {/* Addons List */}
                <div className="space-y-1.5">
                  {addons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-zinc-800/90 border-teal-500/50 text-white'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 text-xs">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isChecked
                                ? 'bg-teal-400 border-teal-300 text-zinc-950'
                                : 'border-zinc-700 bg-zinc-800'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-[11px] font-medium">{addon.name}</span>
                        </div>
                        <span className="text-xs font-bold text-teal-400 font-mono">+{formatAmount(addon.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount Voucher */}
              {!discountClaimed ? (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      Special 15% First-Order Voucher
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Save {formatAmount(Math.round(subtotal * 0.15))} instantly
                    </p>
                  </div>
                  <button
                    onClick={handleClaimDiscount}
                    className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-md hover:scale-105 transition-all cursor-pointer shrink-0"
                  >
                    Claim 15%
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>15% Discount Voucher Applied!</span>
                </div>
              )}

              {/* High-Impact WhatsApp Button */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleOpenQuoteModal}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/50 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Send Quote to WhatsApp →</span>
                </button>

                <p className="text-[11px] text-center text-zinc-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Free Consultation • Direct reply within 5 mins</span>
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
                  This will open WhatsApp with your customized quote details ready to send to Sakhawat.
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

              {/* Client Info Form */}
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
                  <span>Or Schedule a 1-on-1 Discovery Call Instead</span>
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
