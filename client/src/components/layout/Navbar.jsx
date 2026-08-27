import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Menu, X, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';
import Button from '../common/Button';
import UrgencyBanner from '../common/UrgencyBanner';
import { useBrand } from '../../context/BrandContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar = ({ onOpenBooking }) => {
  const { siteLogo } = useBrand();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Urgency Ticker */}
      <UrgencyBanner onOpenBooking={onOpenBooking} />

      {/* Main Glassmorphic Header Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-zinc-950/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
            : 'bg-zinc-950/50 backdrop-blur-xl border-b border-white/[0.05]'
        }`}
        style={{
          boxShadow: scrolled
            ? '0 16px 36px -10px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.08)'
            : 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? 'py-3 sm:py-3.5' : 'py-4 sm:py-5'
            }`}
          >
            {/* 1. BRAND / LOGO WITH STATUS INDICATOR */}
            <Link to="/" className="flex items-center gap-3.5 group cursor-pointer select-none">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="Md Sakhawat Hossain"
                  className="h-10 sm:h-12 w-auto max-w-[240px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center gap-3.5">
                  {/* Glowing Avatar Capsule */}
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 p-[1.5px] shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-all duration-300 group-hover:scale-105">
                      <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center font-display font-black text-base text-teal-300">
                        SH
                      </div>
                    </div>
                    {/* Live Online Radar Pulse Dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-base sm:text-[18px] text-white tracking-tight leading-tight group-hover:text-teal-300 transition-colors">
                        Md Sakhawat Hossain
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-[12px] font-bold text-teal-400 tracking-wider uppercase flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
                      Creative Graphic Designer
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* 2. HI-FI GLASS FLOATING NAVIGATION CAPSULE (Instant 0ms Smooth Navigation) */}
            <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/80 border border-white/[0.08] backdrop-blur-2xl shadow-inner shadow-black/40">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-400 text-zinc-950 font-black shadow-md shadow-teal-500/30'
                        : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 3. HI-FI CTA BUTTON */}
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/book-a-meeting">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 text-zinc-950 font-display font-black text-xs sm:text-sm tracking-tight flex items-center gap-2 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Subtle Light Reflection Glint */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

                  <Calendar className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
                  <span>Book a Meeting</span>
                </motion.button>
              </Link>
            </div>

            {/* 4. MOBILE MENU HAMBURGER BUTTON */}
            <div className="flex md:hidden items-center gap-2">
              <Link to="/book-a-meeting" className="sm:hidden">
                <button className="px-3 py-1.5 rounded-xl bg-teal-500 text-zinc-950 font-bold text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </button>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN DROPDOWN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden mx-4 mt-2 p-5 rounded-3xl bg-zinc-950/95 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black space-y-3 z-50"
          >
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-teal-500 text-zinc-950 font-black shadow-lg shadow-teal-500/20'
                        : 'text-zinc-300 hover:bg-zinc-900/80 hover:text-white'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-600'}`} />
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <Link to="/book-a-meeting" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" icon={Calendar} className="w-full justify-center font-bold">
                  Book a Consultation Call
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
