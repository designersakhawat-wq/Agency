import React from 'react';

const variantStyles = {
  default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  brand: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  primary: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3.5 py-1.5 text-sm',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'emerald'
              ? 'bg-emerald-400 animate-pulse'
              : variant === 'brand' || variant === 'primary'
              ? 'bg-teal-400'
              : 'bg-current'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
