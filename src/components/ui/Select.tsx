'use client';

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              `block w-full px-4 py-3 pr-10
              font-sans text-base text-[#2C2C2C]
              bg-white border rounded appearance-none
              transition-all duration-150
              focus:outline-none cursor-pointer`,
              error
                ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
                : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B8B8B] pointer-events-none"
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-[#C45C5C] flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
