'use client';

import { forwardRef, useState } from 'react';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiLanguageInputProps {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  error?: string;
  hint?: string;
  type?: 'input' | 'textarea';
  placeholder?: Record<string, string>;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'es', label: 'Español', flag: '\u{1F1EA}\u{1F1F8}' },
];

const MultiLanguageInput = forwardRef<HTMLDivElement, MultiLanguageInputProps>(
  (
    {
      label,
      value = {},
      onChange,
      error,
      hint,
      type = 'input',
      placeholder = {},
      required = false,
      rows = 3,
      maxLength,
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState<string>('en');

    const handleInputChange = (langCode: string, newValue: string) => {
      onChange({
        ...value,
        [langCode]: newValue,
      });
    };

    const getCharacterCount = (langCode: string) => {
      const text = value[langCode] || '';
      return text.length;
    };

    const inputClasses = cn(
      `block w-full px-4 py-3
      font-sans text-base text-[#2C2C2C]
      bg-white border rounded
      transition-all duration-150
      placeholder:text-[#8B8B8B]
      focus:outline-none`,
      error
        ? 'border-[#C45C5C] focus:border-[#C45C5C] focus:ring-2 focus:ring-[#C45C5C]/20'
        : 'border-[#E8E0D5] focus:border-[#C4A484] focus:ring-2 focus:ring-[#C4A484]/15'
    );

    return (
      <div ref={ref} className="w-full">
        {/* Label */}
        <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-2">
          {label}
          {required && <span className="text-[#C45C5C] ml-1">*</span>}
        </label>

        {/* Language Tabs */}
        <div className="flex gap-2 mb-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = activeTab === lang.code;
            const hasContent = Boolean(value[lang.code]?.trim());

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveTab(lang.code)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                  isActive
                    ? 'bg-[#C4A484] border-[#C4A484] text-white'
                    : 'bg-white border-[#E8E0D5] text-[#2C2C2C] hover:border-[#C4A484]/50 hover:bg-[#F0EBE3]'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {hasContent && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#A8B5A0]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Input Fields */}
        <div className="space-y-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              className={cn(
                'transition-all duration-200',
                activeTab === lang.code ? 'block' : 'hidden'
              )}
            >
              {type === 'textarea' ? (
                <div className="relative">
                  <textarea
                    value={value[lang.code] || ''}
                    onChange={(e) => handleInputChange(lang.code, e.target.value)}
                    placeholder={
                      placeholder[lang.code] ||
                      `Enter ${label.toLowerCase()} in ${lang.label}...`
                    }
                    rows={rows}
                    maxLength={maxLength}
                    required={required && lang.code === 'en'}
                    className={inputClasses}
                  />
                  {maxLength && (
                    <div className="absolute bottom-3 right-3 text-xs text-[#8B8B8B]">
                      {getCharacterCount(lang.code)}/{maxLength}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={value[lang.code] || ''}
                  onChange={(e) => handleInputChange(lang.code, e.target.value)}
                  placeholder={
                    placeholder[lang.code] ||
                    `Enter ${label.toLowerCase()} in ${lang.label}...`
                  }
                  maxLength={maxLength}
                  required={required && lang.code === 'en'}
                  className={inputClasses}
                />
              )}

              {lang.code !== 'en' && (
                <p className="mt-2 text-xs text-[#8B8B8B]">
                  Optional - Defaults to English if not provided
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Hint */}
        {hint && !error && (
          <div className="mt-2 flex items-start gap-2">
            <Languages className="w-4 h-4 text-[#8B8B8B] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#8B8B8B]">{hint}</p>
          </div>
        )}

        {/* Error Message */}
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

MultiLanguageInput.displayName = 'MultiLanguageInput';

export { MultiLanguageInput };
