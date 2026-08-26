import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Calendar, Menu, X, ArrowUpRight } from 'lucide-react';
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
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black/60'
          : 'bg-[#09090b]/40 backdrop-blur-md'
      }`}
    >
      {/* Top Urgency Ticker */}
      <UrgencyBanner onOpenBooking={onOpenBooking} />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}>
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="Md Sakhawat Hossain"
                className="h-10 sm:h-11 w-auto max-w-[220px] object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-teal-950/50 group-hover:scale-105 transition-transform">
                  SH
                </div>
                <div>
                  <span className="font-display font-bold text-base sm:text-lg text-white tracking-tight block leading-tight">
                    Md Sakhawat Hossain
                  </span>
                  <span className="text-[11px] font-medium text-teal-400 block tracking-wider uppercase">
                    Creative Graphic Designer
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-950/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Highlighted CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/book-a-meeting">
              <Button
                variant="primary"
                size="sm"
                icon={Calendar}
                className="shadow-lg shadow-teal-900/40"
              >
                Book a Meeting
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/book-a-meeting" className="sm:hidden">
              <Button variant="primary" size="sm" icon={Calendar}>
                Book
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl glass-card border border-zinc-800 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-teal-600/20 text-teal-300 font-bold border border-teal-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 border-t border-zinc-800">
              <Link to="/book-a-meeting" className="block w-full">
                <Button variant="primary" size="md" icon={Calendar} className="w-full">
                  Book a Meeting
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
