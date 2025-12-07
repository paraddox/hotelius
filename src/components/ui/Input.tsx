'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[var(--foreground-muted)] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            `block w-full px-4 py-3
            font-sans text-base text-[var(--foreground)]
            bg-[var(--background-elevated)] border rounded-lg
            transition-all duration-150
            placeholder:text-[var(--foreground-muted)]
            focus:outline-none`,
            error
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-2 focus:ring-[rgba(196,92,92,0.2)]'
              : 'border-[var(--color-sand)] focus:border-[var(--color-terracotta)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[var(--color-error)] flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-error)]" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
