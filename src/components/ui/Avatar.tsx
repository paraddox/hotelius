import { HTMLAttributes, forwardRef } from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    const initials = name ? getInitials(name) : '?';

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center rounded-full overflow-hidden',
          'bg-gradient-to-br from-[#C4A484] to-[#A67B5B]',
          'ring-2 ring-white shadow-sm',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-medium text-white tracking-wide">
            {initials}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
