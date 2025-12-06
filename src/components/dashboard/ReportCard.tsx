import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export function ReportCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  iconColor = 'text-amber-600',
  format = 'number',
}: ReportCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        {Icon && (
          <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="h-8 w-8" />
          </div>
        )}
        <div className={Icon ? 'ml-5 w-0 flex-1' : 'w-full'}>
          <dt className="text-sm font-medium text-gray-600 truncate">{title}</dt>
          <dd className="flex items-baseline mt-1">
            <div className="text-3xl font-bold text-gray-900">{formatValue(value)}</div>
            {trend && (
              <div
                className={`ml-3 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <svg
                  className={`h-5 w-5 flex-shrink-0 self-center ${
                    trend.isPositive ? 'text-green-500' : 'text-red-500 rotate-180'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1">
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
            )}
          </dd>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
