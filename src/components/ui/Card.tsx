import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'shadow-[0_1px_3px_rgba(44,44,44,0.04),0_1px_2px_rgba(44,44,44,0.06)]',
      elevated: 'shadow-[0_8px_24px_rgba(44,44,44,0.08),0_4px_8px_rgba(44,44,44,0.04)]',
      interactive: `
        shadow-[0_1px_3px_rgba(44,44,44,0.04)]
        hover:shadow-[0_4px_12px_rgba(44,44,44,0.06)]
        hover:border-[#C4A484]
        hover:-translate-y-1
        transition-all duration-250 cursor-pointer
      `,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-[#E8E0D5] rounded-xl',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium tracking-tight text-[#2C2C2C]",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[#8B8B8B] leading-relaxed', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0 border-t border-[#E8E0D5] mt-6', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

const CardImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-t-xl aspect-[16/10] group',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        {children}
      </div>
    </div>
  )
);
CardImage.displayName = 'CardImage';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage };
