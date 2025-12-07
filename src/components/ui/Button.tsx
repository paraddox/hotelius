'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium tracking-wide
      rounded transition-all duration-250
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      relative overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
      before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500
    `;

    const variants = {
      primary: `
        bg-[#2C2C2C] text-white
        hover:bg-[#4A4A4A] hover:-translate-y-0.5
        hover:shadow-[0_4px_12px_rgba(44,44,44,0.15)]
        focus-visible:ring-[#2C2C2C]
      `,
      default: `
        bg-[#2C2C2C] text-white
        hover:bg-[#4A4A4A] hover:-translate-y-0.5
        hover:shadow-[0_4px_12px_rgba(44,44,44,0.15)]
        focus-visible:ring-[#2C2C2C]
      `,
      secondary: `
        bg-transparent text-[#2C2C2C]
        border border-[#E8E0D5]
        hover:bg-[#F0EBE3] hover:border-[#C4A484]
        focus-visible:ring-[#C4A484]
      `,
      outline: `
        bg-transparent text-[#2C2C2C]
        border border-[#E8E0D5]
        hover:bg-[#F0EBE3] hover:border-[#C4A484]
        focus-visible:ring-[#C4A484]
      `,
      accent: `
        bg-[#C4A484] text-white
        hover:bg-[#A67B5B] hover:-translate-y-0.5
        hover:shadow-[0_4px_12px_rgba(196,164,132,0.25)]
        focus-visible:ring-[#C4A484]
      `,
      ghost: `
        text-[#2C2C2C]
        hover:bg-[#F0EBE3]
        focus-visible:ring-[#C4A484]
      `,
      danger: `
        bg-[#C45C5C] text-white
        hover:bg-[#A84848] hover:-translate-y-0.5
        hover:shadow-[0_4px_12px_rgba(196,92,92,0.25)]
        focus-visible:ring-[#C45C5C]
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
