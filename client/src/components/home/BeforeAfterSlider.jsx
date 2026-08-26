import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MoveHorizontal, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const BeforeAfterSlider = ({ onOpenBooking }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-zinc-950/80 border-t border-zinc-800/80">
      {/* Glow */}
      <div className="ambient-glow-teal top-1/2 -left-20 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Transformation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            See the Difference Professional Design Makes
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3">
            Drag the slider interactively to compare an average unoptimized ad versus our high-converting visual creative.
          </p>
        </motion.div>

        {/* Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Split Screen (7 Cols) */}
          <div className="lg:col-span-8">
            <div
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden glass-card border-2 border-zinc-800 shadow-2xl select-none cursor-ew-resize group"
            >
              {/* After Image (Right / Bottom Layer) */}
              <div className="absolute inset-0 w-full h-full bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&auto=format&fit=crop&q=80"
                  alt="After: High-Converting Creative"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* After Pill */}
                <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-teal-500/90 text-white text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>AFTER: High-Converting Design (+310% CTR)</span>
                </div>
              </div>

              {/* Before Image (Left / Top Clipped Layer) */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80"
                  alt="Before: Generic Stock Design"
                  className="w-full h-full object-cover filter grayscale contrast-75 brightness-75"
                />
                <div className="absolute inset-0 bg-black/40 pointer-events-none" />

                {/* Before Pill */}
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-zinc-800/90 text-zinc-300 text-xs font-bold border border-zinc-700 shadow-xl backdrop-blur-md">
                  <span>BEFORE: Generic Stock Layout (Low Clicks)</span>
                </div>
              </div>

              {/* Draggable Divider Line & Knob */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-20"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-2xl border-2 border-white pointer-events-auto cursor-ew-resize group-hover:scale-110 transition-transform">
                  <MoveHorizontal className="w-5 h-5" />
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-zinc-500 mt-3 flex items-center justify-center gap-1.5">
              <MoveHorizontal className="w-3.5 h-3.5 text-teal-400" />
              <span>Drag or swipe slider across the preview</span>
            </p>
          </div>

          {/* Metric Lift Callout (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-teal-500/30 space-y-6">
              <h3 className="text-xl font-bold font-display text-white">
                The Real ROI of Premium Visual Design
              </h3>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Ad Click-Through (CTR)</span>
                    <span className="text-sm font-bold text-teal-300">+310% Lift</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-teal-400 rounded-full" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Customer Trust & Credibility</span>
                    <span className="text-sm font-bold text-cyan-300">4.8x Higher</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-cyan-400 rounded-full" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Cost Per Acquisition (CPA)</span>
                    <span className="text-sm font-bold text-emerald-300">-42% Reduction</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-emerald-400 rounded-full" />
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onOpenBooking && onOpenBooking('Creative Redesign Transformation')}
              >
                Upgrade My Brand Creatives
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
