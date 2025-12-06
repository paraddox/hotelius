import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('relative', sizes[size], className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'border-2 border-[#E8E0D5]'
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'border-2 border-transparent border-t-[#C4A484]',
          'animate-spin'
        )}
      />
    </div>
  );
};

const PageSpinner = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <Spinner size="lg" />
    {message && (
      <p className="text-sm text-[#8B8B8B] animate-pulse">{message}</p>
    )}
  </div>
);

export { Spinner, PageSpinner };
