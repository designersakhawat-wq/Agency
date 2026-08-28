import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

// Minimal 4-Point Sparkle Star SVG
const SparkleStar = ({ className = '', style = {}, size = 16, filled = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    {filled ? (
      <path
        d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"
        fill="currentColor"
      />
    ) : (
      <path
        d="M12 1.5L14.4 9.6L22.5 12L14.4 14.4L12 22.5L9.6 14.4L1.5 12L9.6 9.6L12 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    )}
  </svg>
);

export const ModernBackgroundElements = () => {
  const { isDark } = useTheme();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none"
    >
      {/* ========================================================================= */}
      {/* 1. AMBIENT RADIAL LIGHTING GLOWS (ADAPTIVE FOR DARK & LIGHT MODES)        */}
      {/* ========================================================================= */}
      {/* Top Right Hero Glow */}
      <div
        className={`absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full blur-[120px] pointer-events-none transition-all duration-500 ${
          isDark
            ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent'
            : 'bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-transparent'
        }`}
      />

      {/* Mid Left Glow */}
      <div
        className={`absolute top-[35%] -left-40 w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none transition-all duration-500 ${
          isDark
            ? 'bg-gradient-to-tr from-teal-500/10 via-cyan-500/10 to-transparent'
            : 'bg-gradient-to-tr from-teal-400/15 via-cyan-300/15 to-transparent'
        }`}
      />

      {/* Bottom Right Pricing/CTA Glow */}
      <div
        className={`absolute bottom-20 -right-20 w-[520px] h-[520px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 ${
          isDark
            ? 'bg-gradient-to-tl from-emerald-500/12 via-teal-500/8 to-transparent'
            : 'bg-gradient-to-tl from-emerald-400/20 via-teal-300/12 to-transparent'
        }`}
      />

      {/* ========================================================================= */}
      {/* 2. FLOWING ORGANIC GUIDE LINE (WAVY SVG SPLINE TRAIL)                    */}
      {/* ========================================================================= */}
      <svg
        className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
          isDark ? 'opacity-35' : 'opacity-25'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 3200"
      >
        <defs>
          <linearGradient id="bgTrailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity={isDark ? '0.6' : '0.8'} />
            <stop offset="30%" stopColor="#14b8a6" stopOpacity={isDark ? '0.4' : '0.6'} />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity={isDark ? '0.5' : '0.7'} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={isDark ? '0.2' : '0.4'} />
          </linearGradient>
        </defs>

        {/* Primary Flowing Curved Line */}
        <path
          d="M 1200,0 C 1350,350 750,700 350,1050 C -50,1400 300,1850 1150,2200 C 1550,2400 950,2850 250,3200"
          fill="none"
          stroke="url(#bgTrailGrad)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
        />

        {/* Secondary Delicate Echo Line */}
        <path
          d="M 1250,50 C 1380,380 800,720 400,1080 C 0,1430 350,1880 1200,2230 C 1600,2430 1000,2880 300,3250"
          fill="none"
          stroke="url(#bgTrailGrad)"
          strokeWidth="0.8"
          strokeOpacity="0.25"
        />
      </svg>

      {/* ========================================================================= */}
      {/* 3. SUBTLE FLOATING 4-POINT STARS & ACCENTS                                */}
      {/* ========================================================================= */}
      {/* Star 1: Hero Top Right */}
      <motion.div
        animate={{ y: [0, -8, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-28 right-[15%] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
      >
        <SparkleStar size={18} filled={true} />
      </motion.div>

      {/* Star 2: Hero Left */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className={`absolute top-72 left-[8%] ${isDark ? 'text-teal-400' : 'text-teal-600'}`}
      >
        <SparkleStar size={14} filled={false} />
      </motion.div>

      {/* Star 3: Near Stats / Trust */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className={`absolute top-[32%] right-[8%] ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}
      >
        <SparkleStar size={16} filled={true} />
      </motion.div>

      {/* Star 4: Mid Section Left */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className={`absolute top-[52%] left-[12%] ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
      >
        <SparkleStar size={20} filled={false} />
      </motion.div>

      {/* Star 5: Portfolio Area */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className={`absolute top-[72%] right-[18%] ${isDark ? 'text-teal-300' : 'text-teal-600'}`}
      >
        <SparkleStar size={15} filled={true} />
      </motion.div>

      {/* Star 6: Bottom Near Footer */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className={`absolute bottom-36 left-[18%] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
      >
        <SparkleStar size={18} filled={true} />
      </motion.div>
    </div>
  );
};

export default ModernBackgroundElements;
