import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, X, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Button from './Button';
import { useCurrency } from '../../context/CurrencyContext';
import { useBrand } from '../../context/BrandContext';

const DEFAULT_EXIT_INTENT = {
  exit_intent_enabled: true,
  exit_intent_badge: "WAIT! DON'T LEAVE EMPTY HANDED",
  exit_intent_title: "Get a {highlight} + {voucher} OFF Your First Project!",
  exit_intent_title_highlight: "Free 5-Point Design Audit",
  exit_intent_subtitle: "Let Sakhawat personally analyze your current ad creatives, logo, or landing page and reveal how to boost your conversion rates.",
  exit_intent_voucher_amount: 50,
  exit_intent_feature_1: "Free Video Screen-Share Audit (No Obligation)",
  exit_intent_feature_2: "{voucher} Credit Instant Voucher towards any package",
  exit_intent_btn_text: "Claim My Free Audit & {voucher} Voucher",
  exit_intent_footer: "100% Privacy Protected • Zero spam ever",
};

export const ExitIntentModal = ({ onOpenBooking }) => {
  const { formatAmount } = useCurrency();
  const { settings: brandSettings } = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [email, setEmail] = useState('');

  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          exit_intent_enabled: parsed.exit_intent_enabled !== undefined ? Boolean(parsed.exit_intent_enabled) : true,
          exit_intent_badge: parsed.exit_intent_badge || DEFAULT_EXIT_INTENT.exit_intent_badge,
          exit_intent_title: parsed.exit_intent_title || DEFAULT_EXIT_INTENT.exit_intent_title,
          exit_intent_title_highlight: parsed.exit_intent_title_highlight || DEFAULT_EXIT_INTENT.exit_intent_title_highlight,
          exit_intent_subtitle: parsed.exit_intent_subtitle || DEFAULT_EXIT_INTENT.exit_intent_subtitle,
          exit_intent_voucher_amount: Number(parsed.exit_intent_voucher_amount) || 50,
          exit_intent_feature_1: parsed.exit_intent_feature_1 || DEFAULT_EXIT_INTENT.exit_intent_feature_1,
          exit_intent_feature_2: parsed.exit_intent_feature_2 || DEFAULT_EXIT_INTENT.exit_intent_feature_2,
          exit_intent_btn_text: parsed.exit_intent_btn_text || DEFAULT_EXIT_INTENT.exit_intent_btn_text,
          exit_intent_footer: parsed.exit_intent_footer || DEFAULT_EXIT_INTENT.exit_intent_footer,
        };
      }
    } catch (e) {}
    return DEFAULT_EXIT_INTENT;
  });

  useEffect(() => {
    if (brandSettings && Object.keys(brandSettings).length > 0) {
      const d = brandSettings;
      setConfig((prev) => ({
        ...prev,
        exit_intent_enabled: d.exit_intent_enabled !== undefined ? Boolean(d.exit_intent_enabled) : prev.exit_intent_enabled,
        exit_intent_badge: d.exit_intent_badge || prev.exit_intent_badge,
        exit_intent_title: d.exit_intent_title || prev.exit_intent_title,
        exit_intent_title_highlight: d.exit_intent_title_highlight || prev.exit_intent_title_highlight,
        exit_intent_subtitle: d.exit_intent_subtitle || prev.exit_intent_subtitle,
        exit_intent_voucher_amount: Number(d.exit_intent_voucher_amount) || prev.exit_intent_voucher_amount,
        exit_intent_feature_1: d.exit_intent_feature_1 || prev.exit_intent_feature_1,
        exit_intent_feature_2: d.exit_intent_feature_2 || prev.exit_intent_feature_2,
        exit_intent_btn_text: d.exit_intent_btn_text || prev.exit_intent_btn_text,
        exit_intent_footer: d.exit_intent_footer || prev.exit_intent_footer,
      }));
    }
  }, [brandSettings]);

  useEffect(() => {
    if (config.exit_intent_enabled === false) return;

    // Check if user already saw exit intent in session
    const seen = sessionStorage.getItem('exit_intent_seen');
    if (seen) {
      setHasTriggered(true);
      return;
    }

    const handleMouseLeave = (e) => {
      // Trigger when mouse moves towards browser tab / exit area
      if (e.clientY <= 15 && !hasTriggered && !isOpen) {
        setIsOpen(true);
        setHasTriggered(true);
        sessionStorage.setItem('exit_intent_seen', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasTriggered, isOpen, config.exit_intent_enabled]);

  const voucherFormatted = formatAmount(config.exit_intent_voucher_amount || 50);

  const handleClaim = (e) => {
    e.preventDefault();
    if (!email) return;

    setClaimed(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#14b8a6', '#06b6d4', '#f59e0b', '#ffffff'],
    });

    setTimeout(() => {
      setIsOpen(false);
      if (onOpenBooking) {
        onOpenBooking(`Claimed ${voucherFormatted} Voucher & Free Audit (${email})`);
      }
    }, 1800);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!config.exit_intent_enabled) return null;

  // Format strings by replacing placeholders
  const renderFeature2 = (config.exit_intent_feature_2 || '')
    .replace('{voucher}', voucherFormatted)
    .replace('$50', voucherFormatted);

  const renderBtnText = (config.exit_intent_btn_text || '')
    .replace('{voucher}', voucherFormatted)
    .replace('$50', voucherFormatted);

  const renderTitle = (config.exit_intent_title || '')
    .replace('{voucher}', voucherFormatted)
    .replace('$50', voucherFormatted);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-lg rounded-3xl glass-panel border-2 border-teal-500/60 p-6 sm:p-8 bg-[#0e131b] shadow-2xl shadow-teal-950/80 z-10 card-shine"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!claimed ? (
              <div className="space-y-6">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>{config.exit_intent_badge || "Wait! Don't Leave Empty Handed"}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">
                    {renderTitle.includes(config.exit_intent_title_highlight) ? (
                      <>
                        {renderTitle.split(config.exit_intent_title_highlight)[0]}
                        <span className="gradient-brand">{config.exit_intent_title_highlight}</span>
                        {renderTitle.split(config.exit_intent_title_highlight)[1]}
                      </>
                    ) : (
                      <>
                        Get a <span className="gradient-brand">{config.exit_intent_title_highlight || 'Free 5-Point Design Audit'}</span> + {voucherFormatted} OFF Your First Project!
                      </>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                    {config.exit_intent_subtitle}
                  </p>
                </div>

                {/* Offer Highlights */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{config.exit_intent_feature_1 || 'Free Video Screen-Share Audit (No Obligation)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-300 font-semibold">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{renderFeature2 || `${voucherFormatted} Credit Instant Voucher towards any package`}</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleClaim} className="space-y-3">
                  <div className="space-y-1">
                    <input
                      type="email"
                      required
                      placeholder="Enter your business email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-black text-sm shadow-xl shadow-teal-950/70 cursor-pointer"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {renderBtnText || `Claim My Free Audit & ${voucherFormatted} Voucher`}
                  </Button>
                </form>

                <p className="text-[11px] text-center text-zinc-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{config.exit_intent_footer || '100% Privacy Protected • Zero spam ever'}</span>
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold font-display text-white">
                  🎉 Voucher Claimed Successfully!
                </h3>
                <p className="text-xs text-zinc-300">
                  Opening the calendar to reserve your Free Creative Audit...
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentModal;
