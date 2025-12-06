'use client';

import { forwardRef, useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ className, label, error, options, value, onChange, placeholder, disabled }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const toggleOption = (optionValue: string) => {
      if (disabled) return;

      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    };

    const removeOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((v) => v !== optionValue));
    };

    const getSelectedLabels = () => {
      return options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);
    };

    const selectedLabels = getSelectedLabels();

    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        {label && (
          <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <div
            ref={ref}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              `min-h-[48px] w-full px-4 py-2
              font-sans text-base text-[#2C2C2C]
              bg-white border rounded cursor-pointer
              transition-all duration-150
              flex items-center justify-between gap-2
              focus:outline-none`,
              error
                ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
                : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex-1 flex flex-wrap gap-1.5">
              {selectedLabels.length === 0 && (
                <span className="text-[#8B8B8B]">{placeholder || 'Select options'}</span>
              )}
              {selectedLabels.map((label, index) => {
                const optionValue = options.find((opt) => opt.label === label)?.value;
                return (
                  <span
                    key={optionValue}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C4A484]/10 text-[#A67B5B] rounded text-sm"
                  >
                    {label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => removeOption(optionValue!, e)}
                        className="hover:text-[#C45C5C] transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-[#8B8B8B] transition-transform duration-200 flex-shrink-0',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>

          {isOpen && (
            <div
              className={cn(
                'absolute z-50 mt-2 w-full bg-white rounded-xl border border-[#E8E0D5]',
                'shadow-[0_16px_48px_rgba(44,44,44,0.1),0_8px_16px_rgba(44,44,44,0.06)]',
                'max-h-60 overflow-auto',
                'animate-in fade-in-0 zoom-in-95 duration-200'
              )}
            >
              <div className="py-1">
                {options.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[#8B8B8B] text-center">
                    No options available
                  </div>
                )}
                {options.map((option) => {
                  const isSelected = value.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm',
                        'flex items-center justify-between gap-2',
                        'transition-colors duration-150',
                        isSelected
                          ? 'bg-[#C4A484]/5 text-[#2C2C2C]'
                          : 'text-[#4A4A4A] hover:bg-[#F0EBE3]'
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-[#C4A484] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
