import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Target, FileCheck, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const WhyChooseSection = ({ settings = {} }) => {
  const whyTitle =
    settings.why_title || 'Why Top Brands & Founders Choose to Work with Sakhawat';
  const whySubtitle =
    settings.why_subtitle ||
    'Here is what sets our creative partnership apart from generic design agencies.';

  const points = [
    {
      num: '01',
      title: settings.why_point1_title || 'Fast 24–48h Turnaround',
      desc:
        settings.why_point1_desc ||
        'Speed matters in marketing. Get production-ready ad creatives and assets in rapid turnaround windows.',
      icon: Clock,
      badge: 'Speed & Agility',
    },
    {
      num: '02',
      title: settings.why_point2_title || 'Sales & Conversion Focused',
      desc:
        settings.why_point2_desc ||
        'Every graphic is structured around marketing psychology, clear visual hierarchy, and proven conversion principles.',
      icon: Target,
      badge: 'Proven ROI',
    },
    {
      num: '03',
      title: settings.why_point3_title || 'Full Commercial & Source Rights',
      desc:
        settings.why_point3_desc ||
        'Receive organized, editable source files (Figma, AI, PSD) along with high-res exports ready for all platforms.',
      icon: FileCheck,
      badge: '100% Ownership',
    },
  ];

  return (
    <section className="py-24 relative bg-zinc-950/60 border-t border-zinc-800/80 overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-teal top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Value & Edge</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
            {whyTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-2xl mx-auto">
            {whySubtitle}
          </p>
        </motion.div>

        {/* 3 Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {points.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="p-8 rounded-3xl glass-card border border-zinc-800/80 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-950/30 transition-all duration-300 flex flex-col justify-between group card-shine relative"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-teal-400 group-hover:bg-teal-500/20 group-hover:text-teal-300 group-hover:border-teal-500/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <point.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-400 border border-zinc-800 group-hover:text-teal-300 group-hover:border-teal-500/30 transition-colors">
                    {point.badge}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-teal-400">
                    {point.num}.
                  </span>
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-teal-300 transition-colors">
                    {point.title}
                  </h3>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                  {point.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-800/60 flex items-center gap-2 text-xs font-medium text-teal-400/90">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Guaranteed Standard on Every Project</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
