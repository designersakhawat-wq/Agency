import React from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';

export const UrgencyBanner = ({ onOpenBooking }) => {
  return (
    <div className="bg-gradient-to-r from-teal-950/90 via-zinc-900 to-teal-950/90 border-b border-teal-500/30 py-2 px-3 sm:px-4 relative overflow-hidden z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
        {/* Limited Capacity Badge */}
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] shrink-0">
          <Flame className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
          <span>Limited Capacity</span>
        </div>

        {/* Urgency Text */}
        <span className="text-zinc-200 font-medium whitespace-nowrap">
          Only <strong className="text-white font-bold underline decoration-teal-400">2 Client Slots Remaining</strong> for This Week!
        </span>

        {/* Bullet & Turnaround */}
        <span className="hidden lg:inline text-zinc-600 shrink-0">•</span>

        <div className="hidden lg:inline-flex items-center gap-1 text-teal-300 font-medium whitespace-nowrap shrink-0">
          <Clock className="w-3 h-3 text-teal-400 shrink-0" />
          <span>24–48h Express Turnaround Available</span>
        </div>

        {/* Reserve Button */}
        <button
          type="button"
          onClick={() => onOpenBooking && onOpenBooking('Rush Client Slot Reservation')}
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold text-[10px] sm:text-[11px] shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap shrink-0 ml-1"
        >
          <span>Reserve Spot</span>
          <ArrowRight className="w-3 h-3 shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default UrgencyBanner;
