import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, Star } from 'lucide-react';

const mixedSocialProofs = [
  {
    id: 1,
    name: 'Tanvir Ahmed',
    company: 'E-Commerce Brand (Dhaka, Bangladesh)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    action: 'Purchased 10x Social Media Ad Creatives Pack',
    time: '2 minutes ago',
    badge: '🇧🇩 Dhaka',
  },
  {
    id: 2,
    name: 'David Miller',
    company: 'Fintech Startup (San Francisco, USA)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    action: 'Booked a 30-min Creative Strategy Call',
    time: '4 minutes ago',
    badge: '🇺🇸 USA',
  },
  {
    id: 3,
    name: 'Fahim Rahman',
    company: 'D2C Fashion Brand (Chittagong, BD)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    action: 'Ordered Complete Brand Identity Suite',
    time: '7 minutes ago',
    badge: '🇧🇩 CTG',
  },
  {
    id: 4,
    name: 'Sarah Al-Mansoor',
    company: 'Luxury Perfumes (Dubai, UAE)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    action: 'Left a 5-Star Review: "Exceptional design quality"',
    time: '11 minutes ago',
    badge: '🇦🇪 Dubai',
  },
  {
    id: 5,
    name: 'Nusrat Jahan',
    company: 'Organic Skincare (Sylhet, Bangladesh)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    action: 'Requested Product Packaging & 3D Mockup',
    time: '14 minutes ago',
    badge: '🇧🇩 Sylhet',
  },
  {
    id: 6,
    name: 'Oliver Bennett',
    company: 'SaaS Platform (London, UK)',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    action: 'Locked In Project Quote ($380)',
    time: '18 minutes ago',
    badge: '🇬🇧 UK',
  },
  {
    id: 7,
    name: 'Ariful Islam',
    company: 'Tech Agency (Gulshan, Dhaka, BD)',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    action: 'Reserved Monthly Creative Retainer',
    time: '23 minutes ago',
    badge: '🇧🇩 Dhaka',
  },
  {
    id: 8,
    name: 'Emily Watson',
    company: 'Shopify Store (Toronto, Canada)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    action: 'Purchased Express Ad Creatives (24h Delivery)',
    time: '29 minutes ago',
    badge: '🇨🇦 Canada',
  },
  {
    id: 9,
    name: 'Mahmudul Hasan',
    company: 'EdTech App (Uttara, Dhaka, BD)',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    action: 'Booked 1-on-1 Discovery Meeting',
    time: '34 minutes ago',
    badge: '🇧🇩 Dhaka',
  },
  {
    id: 10,
    name: 'Liam Henderson',
    company: 'Fitness Apparel (Sydney, Australia)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    action: 'Claimed 15% Welcome Discount Voucher',
    time: '41 minutes ago',
    badge: '🇦🇺 Australia',
  },
];

export const LiveSocialProofToast = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial popup after 2.5s
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    // Exact calibrated pacing: 10 times in 1 minute = 6.0 seconds per cycle
    // (Visible for 4.2 seconds, pauses for 1.8 seconds, then shows next)
    const DISPLAY_DURATION = 4200; // 4.2s
    const PAUSE_DURATION = 1800;   // 1.8s
    const TOTAL_CYCLE = DISPLAY_DURATION + PAUSE_DURATION; // 6000ms (10 times/minute)

    const interval = setInterval(() => {
      // Hide current toast
      setIsVisible(false);

      // Wait 1.8s then show next item
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mixedSocialProofs.length);
        setIsVisible(true);
      }, PAUSE_DURATION);
    }, TOTAL_CYCLE);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  const currentItem = mixedSocialProofs[currentIndex];

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm pointer-events-auto">
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
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Avatar with Live Online Ripple Dot */}
            <div className="relative shrink-0">
              <img
                src={currentItem.avatar}
                alt={currentItem.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-teal-500/40"
              />
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
