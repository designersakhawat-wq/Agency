import React from 'react';

export const BrandsMarquee = ({ brands = [] }) => {
  if (!brands || brands.length === 0) return null;

  // Quadruple array to guarantee infinite marquee
  const displayBrands = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="py-12 border-y border-zinc-800/80 bg-zinc-950/40 relative overflow-hidden group">
      <div className="max-w-7xl mx-auto px-4 mb-5 text-center">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
          Trusted by E-Commerce Brands, Digital Agencies & Creators
        </span>
      </div>

      {/* Infinite scrolling marquee track with pause on hover */}
      <div className="flex overflow-hidden select-none py-2 relative">
        {/* Left and right fade gradient overlays */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#09090b] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#09090b] to-transparent z-10 pointer-events-none" />

        <div className="flex shrink-0 items-center justify-around gap-12 sm:gap-20 animate-marquee group-hover:[animation-play-state:paused] min-w-full">
          {displayBrands.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 hover:scale-105 cursor-default"
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span className="font-display font-bold text-sm sm:text-base text-zinc-300 tracking-tight hover:text-teal-400 transition-colors">
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
