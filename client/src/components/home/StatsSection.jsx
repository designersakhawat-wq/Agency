import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Briefcase, Users, Star, TrendingUp, Sparkles } from 'lucide-react';

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Extract pure numeric part and special chars (e.g., '140+', '99.4%', '3+', '18+')
  const numericMatch = value.toString().match(/([0-9.]+)/);
  const targetNum = numericMatch ? parseFloat(numericMatch[0]) : 0;
  const originalSuffix = value.toString().replace(/^[0-9.]+/, '') || suffix;

  useEffect(() => {
    if (!isInView || targetNum === 0) return;

    let start = 0;
    const duration = 1600; // ms
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      // Easing out cubic
      const progress = frame / totalFrames;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (targetNum - start) * easedProgress;

      if (targetNum % 1 !== 0) {
        setCount(parseFloat(current.toFixed(1)));
      } else {
        setCount(Math.floor(current));
      }

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(targetNum);
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [isInView, targetNum]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {originalSuffix}
    </span>
  );
};

export const StatsSection = ({ settings = {} }) => {
  const stats = [
    {
      label: 'Years of Experience',
      value: settings.hero_years_exp || '3+',
      desc: 'Crafting brand & marketing assets for global businesses',
      icon: Award,
      color: 'teal',
    },
    {
      label: 'Creatives Delivered',
      value: settings.hero_projects_count || '150+',
      desc: 'High-converting ad designs, branding & video edits',
      icon: Briefcase,
      color: 'cyan',
    },
    {
      label: 'Client Satisfaction',
      value: settings.hero_client_satisfaction || '99.4%',
      desc: 'Based on 50+ verified 5-star client ratings',
      icon: Star,
      color: 'amber',
    },
    {
      label: 'Global Clients',
      value: '18+',
      desc: 'Collaborating across USA, Dubai, UK & Bangladesh',
      icon: Users,
      color: 'teal',
    },
  ];

  return (
    <section className="relative py-16 border-y border-zinc-800/80 bg-zinc-950/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-5 sm:p-6 rounded-2xl glass-card border border-zinc-800/70 relative group hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/20 transition-all duration-300 card-shine"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-black text-2xl sm:text-4xl text-white group-hover:text-teal-300 transition-colors">
                  <AnimatedCounter value={item.value} />
                </span>
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-teal-300 group-hover:bg-teal-500/10 group-hover:border-teal-500/30 transition-all duration-300 group-hover:scale-110">
                  <item.icon className="w-5 h-5" />
                </div>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-zinc-200 mb-1 group-hover:text-white transition-colors">
                {item.label}
              </h4>
              <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-2">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
