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
            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            `block w-full px-4 py-3
            font-sans text-base text-[#2C2C2C]
            bg-white border rounded
            transition-all duration-150
            placeholder:text-[#8B8B8B]
            focus:outline-none`,
            error
              ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
              : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[#8B8B8B]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
