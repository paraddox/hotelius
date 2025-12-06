import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { TrendingUp, DollarSign, Calendar, FileText, BarChart3, PieChart } from 'lucide-react';

const reportCategories = [
  {
    name: 'occupancy',
    href: '/dashboard/reports/occupancy',
    icon: TrendingUp,
    color: 'bg-amber-100 text-amber-700',
    description: 'View occupancy rates, room utilization, and booking trends',
  },
  {
    name: 'revenue',
    href: '/dashboard/reports/revenue',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Analyze revenue streams, ADR, and RevPAR metrics',
  },
  {
    name: 'bookings',
    href: '/dashboard/reports/bookings',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-700',
    description: 'Track booking patterns, sources, and conversion rates',
    comingSoon: true,
  },
  {
    name: 'performance',
    href: '/dashboard/reports/performance',
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-700',
    description: 'Overall hotel performance and KPI dashboard',
    comingSoon: true,
  },
  {
    name: 'guests',
    href: '/dashboard/reports/guests',
    icon: PieChart,
    color: 'bg-pink-100 text-pink-700',
    description: 'Guest demographics and behavior analysis',
    comingSoon: true,
  },
  {
    name: 'custom',
    href: '/dashboard/reports/custom',
    icon: FileText,
    color: 'bg-gray-100 text-gray-700',
    description: 'Create and save custom report templates',
    comingSoon: true,
  },
];

export default async function ReportsPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.reports');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-700">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          const content = (
            <div className="relative h-full overflow-hidden rounded-lg bg-white px-6 py-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className={`inline-flex rounded-lg p-3 ${category.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {t(`categories.${category.name}.title`)}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {category.description}
              </p>
              {category.comingSoon && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Coming Soon
                </span>
              )}
              {!category.comingSoon && (
                <div className="mt-6">
                  <span className="text-sm font-medium text-amber-600 hover:text-amber-700">
                    {t('viewReport')} →
                  </span>
                </div>
              )}
            </div>
          );

          if (category.comingSoon) {
            return <div key={category.name}>{content}</div>;
          }

          return (
            <Link key={category.name} href={category.href}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start">
          <FileText className="h-6 w-6 text-amber-600 mt-1" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('exportData.title')}
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              {t('exportData.description')}
            </p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
              {t('exportData.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
