import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md';
}

const Badge = ({ className, variant = 'default', size = 'md', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-[#F0EBE3] text-[#4A4A4A]',
    success: 'bg-[#E8F5E9] text-[#4A7C59]',
    warning: 'bg-[#FFF3E0] text-[#D4A574]',
    error: 'bg-[#FFEBEE] text-[#C45C5C]',
    info: 'bg-[#E3F2FD] text-[#5B7FA6]',
    accent: 'bg-[#C4A484]/10 text-[#A67B5B]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium tracking-wide uppercase',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export { Badge };
