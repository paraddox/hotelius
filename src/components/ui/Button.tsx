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
      rounded-lg transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      relative overflow-hidden
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
      before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500
    `;

    const variants = {
      primary: `
        bg-[var(--color-charcoal)] text-[var(--color-pearl)]
        hover:bg-[var(--color-slate)] hover:-translate-y-0.5
        hover:shadow-[var(--shadow-soft)]
        focus-visible:ring-[var(--color-charcoal)]
      `,
      default: `
        bg-[var(--color-charcoal)] text-[var(--color-pearl)]
        hover:bg-[var(--color-slate)] hover:-translate-y-0.5
        hover:shadow-[var(--shadow-soft)]
        focus-visible:ring-[var(--color-charcoal)]
      `,
      secondary: `
        bg-transparent text-[var(--foreground)]
        border border-[var(--color-sand)]
        hover:bg-[var(--color-cream-dark)] hover:border-[var(--color-terracotta)]
        focus-visible:ring-[var(--color-terracotta)]
      `,
      outline: `
        bg-transparent text-[var(--foreground)]
        border border-[var(--color-sand)]
        hover:bg-[var(--color-cream-dark)] hover:border-[var(--color-terracotta)]
        focus-visible:ring-[var(--color-terracotta)]
      `,
      accent: `
        bg-[var(--color-terracotta)] text-[var(--color-pearl)]
        hover:bg-[var(--color-terracotta-dark)] hover:-translate-y-0.5
        hover:shadow-[var(--shadow-soft)]
        focus-visible:ring-[var(--color-terracotta)]
      `,
      ghost: `
        text-[var(--foreground)]
        hover:bg-[var(--color-cream-dark)]
        focus-visible:ring-[var(--color-terracotta)]
      `,
      danger: `
        bg-[var(--color-error)] text-[var(--color-pearl)]
        hover:opacity-90 hover:-translate-y-0.5
        hover:shadow-[var(--shadow-soft)]
        focus-visible:ring-[var(--color-error)]
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
