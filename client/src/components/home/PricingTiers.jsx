import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import Button from '../common/Button';

import { DEFAULT_PACKAGES } from '../../data/defaultData';

export const PricingTiers = ({ packages = [], onSelectPackage }) => {
  const { formatAmount } = useCurrency();
  const displayPackages = Array.isArray(packages) && packages.length > 0 ? packages : DEFAULT_PACKAGES;
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-teal top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Pricing Packages</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Transparent Creative Investment
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Predictable flat-rate packages with defined deliverables, revisions, and dedicated communication.
          </p>
        </motion.div>

        {/* Pricing Cards Grid with Top Clearance for Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {(displayPackages.length > 3 ? displayPackages.slice(0, 3) : displayPackages).map((pkg, idx) => {
            let parsedFeatures = [];
            if (Array.isArray(pkg.features)) {
              parsedFeatures = pkg.features;
            } else if (typeof pkg.features === 'string') {
              try {
                parsedFeatures = JSON.parse(pkg.features);
              } catch (e) {
                parsedFeatures = [];
              }
            }

            return (
              <motion.div
                key={pkg.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 overflow-visible ${
                  pkg.isPopular
                    ? 'bg-gradient-to-b from-teal-950/80 via-zinc-900/95 to-zinc-950 border-2 border-teal-500 shadow-2xl shadow-teal-950/60 md:-translate-y-2'
                    : 'glass-card border border-zinc-800/80 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-950/20'
                }`}
              >
                {/* Popular Ribbon without clipping */}
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 text-black font-black text-[11px] tracking-wider uppercase shadow-xl shadow-teal-950/80 flex items-center gap-1.5 border border-teal-200">
                      <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
                      <span>Most Popular</span>
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-xl text-white">{pkg.name}</h3>
                    {pkg.service?.title && (
                      <span className="text-[10px] text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full font-medium">
                        {pkg.service.title}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 min-h-[36px] leading-relaxed">
                    {pkg.description || 'Comprehensive graphic design & high-conversion visual suite.'}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pb-6 border-b border-zinc-800/80">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white">
                      {formatAmount(pkg.price)}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      /{pkg.billingPeriod || 'project'}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Included in Package:
                    </p>
                    {parsedFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-xs text-zinc-300">
                        <div className="p-0.5 rounded-full bg-teal-500/20 text-teal-400 mt-0.5 shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    variant={pkg.isPopular ? 'primary' : 'outline'}
                    size="md"
                    className="w-full font-bold"
                    onClick={() => onSelectPackage && onSelectPackage(pkg)}
                  >
                    {pkg.ctaText || 'Select Package'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Scope Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 p-8 rounded-3xl glass-card border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left card-shine"
        >
          <div>
            <h4 className="text-lg font-bold text-white">Need a Monthly Retainer or Custom Creative Direction?</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Available for dedicated agency contracts, monthly ad creative production, and fractional lead design roles.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectPackage && onSelectPackage({ name: 'Custom Scope / Retainer' })}
          >
            Request Custom Scope
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingTiers;
