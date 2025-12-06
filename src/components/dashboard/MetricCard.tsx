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
  iconColor = 'text-blue-600',
}: MetricCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-200">
      <div className="flex items-center">
        {Icon && (
          <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className={Icon ? 'ml-5 w-0 flex-1' : 'w-full'}>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">{value}</div>
            {trend && (
              <div
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </div>
            )}
          </dd>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
