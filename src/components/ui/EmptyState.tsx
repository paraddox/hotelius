import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-6 p-4 rounded-full bg-[#F0EBE3] text-[#C4A484]">
          {icon}
        </div>
      )}
      <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-xl font-medium text-[#2C2C2C] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#8B8B8B] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export { EmptyState };
