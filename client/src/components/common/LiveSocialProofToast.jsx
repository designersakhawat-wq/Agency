import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, Star } from 'lucide-react';

const mixedSocialProofs = [
  {
    id: 1,
    name: 'Tanvir Ahmed',
    initials: 'TA',
    gradient: 'from-teal-500 to-emerald-600',
    company: 'E-Commerce Brand (Dhaka, Bangladesh)',
    action: 'Purchased 10x Social Media Ad Creatives Pack',
    time: '2 minutes ago',
    badge: '🇧🇩 Dhaka',
  },
  {
    id: 2,
    name: 'David Miller',
    initials: 'DM',
    gradient: 'from-blue-500 to-indigo-600',
    company: 'Fintech Startup (San Francisco, USA)',
    action: 'Booked a 30-min Creative Strategy Call',
    time: '4 minutes ago',
    badge: '🇺🇸 USA',
  },
  {
    id: 3,
    name: 'Sarah Al-Mansoor',
    initials: 'SA',
    gradient: 'from-purple-500 to-pink-600',
    company: 'Luxury Perfumes (Dubai, UAE)',
    action: 'Left a 5-Star Review: "Exceptional design quality"',
    time: '11 minutes ago',
    badge: '🇦🇪 Dubai',
  },
  {
    id: 4,
    name: 'Fahim Rahman',
    initials: 'FR',
    gradient: 'from-amber-500 to-orange-600',
    company: 'D2C Fashion Brand (Chittagong, BD)',
    action: 'Ordered Complete Brand Identity Suite',
    time: '18 minutes ago',
    badge: '🇧🇩 CTG',
  },
  {
    id: 5,
    name: 'Oliver Bennett',
    initials: 'OB',
    gradient: 'from-cyan-500 to-blue-600',
    company: 'SaaS Platform (London, UK)',
    action: 'Locked In Project Quote ($380)',
    time: '24 minutes ago',
    badge: '🇬🇧 UK',
  },
];

export const LiveSocialProofToast = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('sakhawat_social_proof_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isDismissed) return;

    // Show first toast at 4 seconds
    const timer1 = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    // Hide first toast at 9 seconds (visible for 5s)
    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 9000);

    // Show second toast at 24 seconds
    const timer3 = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mixedSocialProofs.length);
      setIsVisible(true);
    }, 24000);

    // Hide second toast at 29 seconds (visible for 5s)
    const timer4 = setTimeout(() => {
      setIsVisible(false);
    }, 29000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      sessionStorage.setItem('sakhawat_social_proof_dismissed', 'true');
    } catch (e) {}
  };

  const currentItem = mixedSocialProofs[currentIndex];

  if (isDismissed || !currentItem) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 25, scale: 0.92, x: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 15, scale: 0.92, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-teal-500/35 shadow-2xl shadow-black/85 flex items-start gap-3 bg-[#0e131b]/98 backdrop-blur-xl relative group"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Zero-Network Instant Gradient Avatar Capsule with Live Radar Pulse */}
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentItem.gradient} p-[1.5px] shadow-md`}
              >
                <div className="w-full h-full rounded-full bg-zinc-950/80 flex items-center justify-center font-display font-black text-xs text-white">
                  {currentItem.initials}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#09090b] flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 pr-4 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white">{currentItem.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/15 text-teal-300 border border-teal-500/25 font-bold">
                  {currentItem.badge}
                </span>
              </div>

              <p className="text-xs text-zinc-200 font-medium leading-tight">
                {currentItem.action}
              </p>

              <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-0.5">
                <span className="truncate max-w-[180px]">{currentItem.company}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-teal-400/90 shrink-0 font-medium">
                  <Clock className="w-2.5 h-2.5" />
                  {currentItem.time}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSocialProofToast;
