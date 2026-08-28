import React from 'react';
import { DEFAULT_BRANDS } from '../../data/defaultData';

export const BrandsMarquee = ({ brands = [] }) => {
  const sourceBrands = Array.isArray(brands) && brands.length > 0 ? brands : DEFAULT_BRANDS;
  if (!sourceBrands || sourceBrands.length === 0) return null;

  // Quadruple array to guarantee infinite marquee
  const displayBrands = [...sourceBrands, ...sourceBrands, ...sourceBrands, ...sourceBrands];

  return (
    <div className="py-12 border-y border-slate-200 dark:border-zinc-800/80 bg-slate-100/60 dark:bg-zinc-950/40 relative overflow-hidden group transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 mb-5 text-center">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
          Trusted by E-Commerce Brands, Digital Agencies & Creators
        </span>
      </div>

      {/* Infinite scrolling marquee track with pause on hover */}
      <div className="flex overflow-hidden select-none py-2 relative">
        {/* Left and right fade gradient overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-slate-50 dark:from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-slate-50 dark:from-[#09090b] to-transparent z-10 pointer-events-none" />

        <div className="flex shrink-0 items-center justify-around gap-12 sm:gap-20 animate-marquee group-hover:[animation-play-state:paused] min-w-full">
          {displayBrands.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 hover:scale-105 cursor-default"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span className="font-display font-bold text-sm sm:text-base text-slate-800 dark:text-zinc-300 tracking-tight hover:text-teal-500 transition-colors">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandsMarquee;
