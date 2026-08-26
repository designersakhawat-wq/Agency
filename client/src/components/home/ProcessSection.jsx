import React from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, Layout, Rocket, Sparkles, CheckCircle } from 'lucide-react';

export const ProcessSection = () => {
  const steps = [
    {
      num: '01',
      title: 'Brief & Creative Discovery',
      desc: 'We analyze your brand guidelines, target audience psychology, campaign objectives, and competitor benchmarks.',
      icon: Search,
      deliverable: 'Creative Strategy & Moodboard',
    },
    {
      num: '02',
      title: 'Concept Ideation & Visual Angles',
      desc: 'Developing multiple distinct creative directions and visual hooks crafted specifically to stop the scroll.',
      icon: Compass,
      deliverable: 'Initial Design Drafts & Variations',
    },
    {
      num: '03',
      title: 'Refinement & Pixel Perfection',
      desc: 'Fine-tuning typography, visual hierarchy, color grading, and CTA positioning based on feedback loops.',
      icon: Layout,
      deliverable: 'High-Res Production Assets',
    },
    {
      num: '04',
      title: 'Final Delivery & Launch Support',
      desc: 'Exporting optimized file formats (PNG, SVG, MP4, Print PDFs) organized and ready for immediate deployment.',
      icon: Rocket,
      deliverable: 'Ready-to-Deploy Export Package',
    },
  ];

  return (
    <section className="py-24 relative bg-zinc-950/40 border-t border-zinc-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow & Collaboration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Seamless 4-Step Design Process
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Fast turnarounds, clear communication, and guaranteed quality at every milestone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-6 rounded-2xl glass-card border border-zinc-800/80 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/30 transition-all duration-300 flex flex-col justify-between group card-shine relative"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:bg-teal-500/20 group-hover:text-teal-300 group-hover:border-teal-500/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="font-display font-black text-3xl text-zinc-700/60 group-hover:text-teal-400/50 transition-colors">
                    {step.num}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-2 leading-snug group-hover:text-teal-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-semibold uppercase text-zinc-500 block leading-tight">
                    Deliverable
                  </span>
                  <span className="text-xs font-semibold text-teal-300">{step.deliverable}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
