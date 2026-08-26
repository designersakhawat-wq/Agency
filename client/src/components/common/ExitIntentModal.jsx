import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, X, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Button from './Button';
import { useCurrency } from '../../context/CurrencyContext';

export const ExitIntentModal = ({ onOpenBooking }) => {
  const { formatAmount } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
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
  }, [hasTriggered, isOpen]);

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
        onOpenBooking(`Claimed ${formatAmount(50)} Voucher & Free Audit (${email})`);
      }
    }, 1800);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!claimed ? (
              <div className="space-y-6">
                {/* Header Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Wait! Don't Leave Empty Handed</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">
                    Get a <span className="gradient-brand">Free 5-Point Design Audit</span> + {formatAmount(50)} OFF Your First Project!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                    Let Sakhawat personally analyze your current ad creatives, logo, or landing page and reveal how to boost your conversion rates.
                  </p>
                </div>

                {/* Offer Highlights */}
                <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs text-zinc-300">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Free Video Screen-Share Audit (No Obligation)</span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-300 font-semibold">
                    <Check className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>$50 Credit Instant Voucher towards any package</span>
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
                    className="w-full font-black text-sm shadow-xl shadow-teal-950/70"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Claim My Free Audit & $50 Voucher
                  </Button>
                </form>

                <p className="text-[11px] text-center text-zinc-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>100% Privacy Protected • Zero spam ever</span>
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
