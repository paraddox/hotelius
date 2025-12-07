import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  iconColor = 'text-[var(--color-terracotta)]',
}: MetricCardProps) {
  return (
    <div className="card overflow-hidden rounded-xl bg-[var(--background-elevated)] px-4 py-5 sm:p-6 border border-[var(--color-sand)] transition-all duration-300 hover:border-[var(--color-terracotta)] hover:shadow-md">
      <div className="flex items-center">
        {Icon && (
          <div className={`flex-shrink-0 p-2 rounded-lg bg-[rgba(196,164,132,0.1)] ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className={Icon ? 'ml-4 w-0 flex-1' : 'w-full'}>
          <dt className="text-label text-xs font-semibold tracking-wider uppercase text-[var(--foreground-muted)] truncate">{title}</dt>
          <dd className="flex items-baseline mt-1">
            <div className="font-serif text-2xl font-medium text-[var(--foreground)]">{value}</div>
            {trend && (
              <div
                className={`ml-2 flex items-baseline text-sm font-medium ${
                  trend.isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                }`}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </div>
            )}
          </dd>
          {description && (
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
