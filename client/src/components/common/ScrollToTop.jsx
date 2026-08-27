import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
            setScrollProgress(progress);
          }
          setIsVisible(window.scrollY > 280);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Radius = 20, Circumference = 2 * PI * 20 = 125.66
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * scrollProgress) / 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="fixed bottom-24 right-6 sm:right-8 z-40 pointer-events-auto"
        >
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
            className="relative w-12 h-12 rounded-full bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/80 group transition-all duration-300 hover:scale-110 cursor-pointer overflow-hidden border border-white/5 hover:border-teal-500/40"
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

            {/* Concentric Smooth SVG Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
              viewBox="0 0 48 48"
            >
              <defs>
                <linearGradient id="scrollTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Background Track Ring */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="text-zinc-800/80"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
              />

              {/* Active Dynamic Progress Ring */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                stroke="url(#scrollTopGradient)"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                style={{
                  transition: 'stroke-dashoffset 80ms ease-out',
                }}
              />
            </svg>

            {/* Sleek Arrow Icon */}
            <ArrowUp className="w-5 h-5 text-teal-400 group-hover:text-white transition-all duration-200 relative z-10 group-hover:-translate-y-1" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
