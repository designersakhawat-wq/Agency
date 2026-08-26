import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import Button from '../common/Button';
import { useBrand } from '../../context/BrandContext';

export const Footer = ({ onOpenBooking }) => {
  const { siteLogo } = useBrand();

  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-800/80 pt-16 pb-12 overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-teal -top-40 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Col 1 & 2: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="Md Sakhawat Hossain"
                  className="h-10 sm:h-12 w-auto max-w-[220px] object-contain"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-display font-black text-lg shadow-lg shadow-teal-950/40">
                    SH
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-white block leading-tight">
                      Md Sakhawat Hossain
                    </span>
                    <span className="text-xs font-semibold text-teal-400 block tracking-wider uppercase">
                      Creative Graphic Designer
                    </span>
                  </div>
                </>
              )}
            </Link>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Helping brands stand out, sell better, and look professional through sales-driven advertising creatives, distinct brand identities, e-commerce product design, and dynamic UGC video content.
            </p>

            {/* Quick Consultation Trigger */}
            <div className="pt-2">
              <Link to="/book-a-meeting">
                <Button variant="primary" size="sm" icon={Calendar}>
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Home', path: '/' },
                { name: 'Services Overview', path: '/services' },
                { name: 'Portfolio Showcase', path: '/portfolio' },
                { name: 'About Sakhawat', path: '/about' },
                { name: 'Contact & Inquiries', path: '/contact' },
                { name: 'Book a Meeting', path: '/book-a-meeting' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-zinc-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Core Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Logo & Branding', path: '/services/logo-branding' },
                { name: 'Ads Creative', path: '/services/ads-creative' },
                { name: 'UGC Video', path: '/services/ugc-video' },
                { name: 'Cover Branding', path: '/services/cover-branding' },
              ].map((s) => (
                <li key={s.path}>
                  <Link
                    to={s.path}
                    className="text-zinc-400 hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                  >
                    {s.name}
                    <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <a
                href="mailto:designersakhawat@gmail.com"
                className="flex items-center gap-2.5 hover:text-teal-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="truncate">designersakhawat@gmail.com</span>
              </a>

              <a
                href="tel:01781955355"
                className="flex items-center gap-2.5 hover:text-teal-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>01781955355</span>
              </a>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Ishurdi, Pabna, Rajshahi, Bangladesh</span>
              </div>

              {/* Social Links */}
              <div className="pt-3 flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/designersakhawat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.behance.net/sakhawatdesigner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 transition-colors font-bold text-xs"
                  title="Behance"
                >
                  Bē
                </a>
                <a
                  href="https://designersakhawat.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 transition-colors"
                  title="Personal Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Md Sakhawat Hossain. All Rights Reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/contact" className="hover:text-zinc-300">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-zinc-300">
              Terms & Conditions
            </Link>
            <Link to="/admin/login" className="text-zinc-500 hover:text-zinc-400">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
