import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Button from './Button';
import { useCurrency } from '../../context/CurrencyContext';

export const PackageActionModal = ({
  isOpen,
  onClose,
  serviceName = 'Creative Graphic Design',
  pkg = null,
  whatsappNumber = '8801781955355',
}) => {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();

  if (!isOpen || !pkg) return null;

  const rawPhone = (whatsappNumber || '01781955355').replace(/[^\d]/g, '');
  const finalPhone = rawPhone.startsWith('88') ? rawPhone : `88${rawPhone}`;

  const formattedPrice = formatAmount(pkg.price);

  // Formulate pre-filled WhatsApp message
  const waText = encodeURIComponent(
    `Hi Sakhawat! 👋\n\nI want to order/discuss the following package on your website:\n\n• Service: ${serviceName}\n• Package: ${pkg.name}\n• Investment: ${formattedPrice}${pkg.billingPeriod ? ` / ${pkg.billingPeriod}` : ''}\n\nPlease let me know your current availability to get started!`
  );

  const whatsappUrl = `https://wa.me/${finalPhone}?text=${waText}`;

  const handleBookMeeting = () => {
    onClose();
    navigate('/book-a-meeting', {
      state: {
        serviceName,
        packageName: pkg.name,
        packagePrice: pkg.price,
      },
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl glass-card border-2 border-teal-500/40 bg-zinc-950/95 p-6 sm:p-8 shadow-2xl shadow-teal-950/50 z-10 space-y-6 overflow-hidden"
        >
          {/* Ambient Top Glow */}
          <div className="ambient-glow-teal -top-24 -right-24 opacity-30 pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="space-y-1.5 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Quick Order / Consultation
            </div>
            <h3 className="text-2xl font-display font-black text-white">
              How would you like to connect?
            </h3>
            <p className="text-xs text-zinc-400">
              Select your preferred way to kickstart your project with Sakhawat.
            </p>
          </div>

          {/* Selected Package Snapshot Pill */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  {serviceName}
                </span>
                <span className="text-base font-bold text-white">{pkg.name}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-display text-white">{formattedPrice}</span>
                {pkg.billingPeriod && (
                  <span className="text-[10px] text-zinc-400 block">/{pkg.billingPeriod}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-teal-400">
                <Clock className="w-3.5 h-3.5" /> Fast Turnaround
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Commercial Release
              </span>
            </div>
          </div>

          {/* Two Direct Action Options */}
          <div className="space-y-3.5">
            {/* OPTION 1: Instant WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="group block p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/40 transition-all duration-300 shadow-lg shadow-emerald-950/30 relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                        Instant WhatsApp Chat
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                        Fastest (2m)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Send requirement details directly to <span className="text-emerald-400 font-mono font-semibold">+880 1781-955355</span>
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </a>

            {/* OPTION 2: Book Discovery Meeting */}
            <button
              onClick={handleBookMeeting}
              className="w-full text-left group block p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-teal-500/50 hover:bg-zinc-900 transition-all duration-300 shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-zinc-950 transition-all">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-black text-white group-hover:text-teal-300 transition-colors block">
                      Book a Strategy Meeting
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Reserve a 30-min Google Meet / Zoom discovery consultation
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </button>
          </div>

          {/* Reassurance Footer */}
          <div className="pt-2 text-center text-[11px] text-zinc-500">
            🔒 Zero obligation • Full confidentiality & commercial agreement ready
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PackageActionModal;
