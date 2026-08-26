import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react';

export const TestimonialsSlider = ({ testimonials = [] }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!testimonials || testimonials.length === 0) return null;

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const current = testimonials[currentIdx];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="ambient-glow-teal top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Praise & Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Trusted by Brands & Founders
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative glass-card rounded-3xl p-8 sm:p-14 border border-zinc-800 shadow-2xl card-shine">
          <Quote className="w-12 h-12 text-teal-500/20 absolute top-8 right-8 pointer-events-none" />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* Rating Stars with Stagger */}
              <div className="flex items-center gap-1.5">
                {[...Array(current.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-lg sm:text-2xl text-zinc-100 font-light leading-relaxed italic">
                "{current.content}"
              </p>

              {/* Client Profile */}
              <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80">
                <div className="flex items-center gap-4">
                  {current.clientAvatar ? (
                    <img
                      src={current.clientAvatar}
                      alt={current.clientName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/40"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center font-bold text-white text-base shadow-lg">
                      {current.clientName[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display font-bold text-base text-white">{current.clientName}</h4>
                    <p className="text-xs text-zinc-400">
                      {current.clientRole} • <span className="text-teal-400">{current.clientCompany}</span>
                    </p>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label="Previous review"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label="Next review"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
