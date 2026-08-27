import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Palette,
  Megaphone,
  Video,
  Layout,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';

const iconMap = {
  Palette: Palette,
  Megaphone: Megaphone,
  Video: Video,
  Layout: Layout,
};

import { DEFAULT_SERVICES } from '../../data/defaultData';

export const ServicesGrid = ({ services = [], onOpenBooking }) => {
  const displayServices = Array.isArray(services) && services.length > 0 ? services : DEFAULT_SERVICES;
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-cyan top-1/2 right-0 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Expert Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Design Solutions Tailored for Conversion
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              From memorable branding systems to high-performing digital marketing assets that elevate your brand and drive customer action.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to="/services">
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                Explore All Services
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayServices.map((s, idx) => {
            const Icon = iconMap[s.icon] || Palette;
            const features = Array.isArray(s.features) ? s.features : [];

            return (
              <motion.div
                key={s.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="p-8 sm:p-10 rounded-3xl glass-card border border-zinc-800 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-950/25 transition-all duration-300 flex flex-col justify-between group space-y-6 card-shine"
              >
                <div className="space-y-4">
                  {/* Animated Icon Box */}
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:bg-teal-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-teal-950/30">
                    <Icon className="w-7 h-7" />
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-display text-white group-hover:text-teal-300 transition-colors">
                      {s.title}
                    </h3>
                    {s.tagline && (
                      <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mt-1">
                        {s.tagline}
                      </p>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                    {s.description}
                  </p>

                  {features.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      {features.slice(0, 3).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-400">
                          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-800/80 flex items-center justify-between">
                  <Link to={`/services/${s.slug}`}>
                    <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                      Service Details
                    </Button>
                  </Link>
                  <button
                    onClick={() => onOpenBooking && onOpenBooking(s)}
                    className="text-xs font-semibold text-zinc-400 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    Start Project →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
