'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-[#2C2C2C]/60 backdrop-blur-sm',
            'transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div
          className={cn(
            'relative w-full transform bg-white rounded-2xl',
            'shadow-[0_25px_50px_-12px_rgba(44,44,44,0.25)]',
            'transition-all duration-300',
            isOpen
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-4',
            sizes[size]
          )}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 z-10',
                'p-2 rounded-full',
                'text-[#8B8B8B] hover:text-[#2C2C2C]',
                'hover:bg-[#F0EBE3]',
                'transition-all duration-150'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-0">
              {title && (
                <h2 className="font-['Cormorant_Garamond',Georgia,serif] text-2xl font-medium text-[#2C2C2C] pr-8">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-2 text-sm text-[#8B8B8B]">{description}</p>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div
    className={cn(
      'flex items-center justify-end gap-3 pt-4 mt-4',
      'border-t border-[#E8E0D5]',
      className
    )}
  >
    {children}
  </div>
);

export { Modal, ModalFooter };
