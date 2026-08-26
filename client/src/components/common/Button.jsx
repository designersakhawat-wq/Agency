import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:
    'bg-[var(--brand-primary,#14b8a6)] hover:brightness-105 text-[var(--brand-text-on-primary,#ffffff)] shadow-lg shadow-black/40 active:scale-[0.98] border border-[var(--brand-secondary,#06b6d4)]/30 font-bold',
  secondary:
    'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 active:scale-[0.98] font-medium',
  outline:
    'bg-transparent hover:bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:border-teal-400 active:scale-[0.98] font-semibold',
  ghost:
    'bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white active:scale-[0.98]',
  danger:
    'bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-950/30 active:scale-[0.98] font-semibold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm sm:text-base rounded-xl gap-2.5 font-semibold',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}

      <span>{children}</span>

      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export default Button;
