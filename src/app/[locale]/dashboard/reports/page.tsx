import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { TrendingUp, DollarSign, Calendar, FileText, BarChart3, PieChart } from 'lucide-react';

const reportCategories = [
  {
    name: 'occupancy',
    href: '/dashboard/reports/occupancy',
    icon: TrendingUp,
    color: 'bg-[rgba(196,164,132,0.15)] text-[var(--color-terracotta)]',
    description: 'View occupancy rates, room utilization, and booking trends',
  },
  {
    name: 'revenue',
    href: '/dashboard/reports/revenue',
    icon: DollarSign,
    color: 'bg-[rgba(74,124,89,0.1)] text-[var(--color-success)]',
    description: 'Analyze revenue streams, ADR, and RevPAR metrics',
  },
  {
    name: 'bookings',
    href: '/dashboard/reports/bookings',
    icon: Calendar,
    color: 'bg-[rgba(135,168,120,0.1)] text-[var(--color-sage)]',
    description: 'Track booking patterns, sources, and conversion rates',
    comingSoon: true,
  },
  {
    name: 'performance',
    href: '/dashboard/reports/performance',
    icon: BarChart3,
    color: 'bg-[rgba(196,164,132,0.2)] text-[var(--color-terracotta-dark)]',
    description: 'Overall hotel performance and KPI dashboard',
    comingSoon: true,
  },
  {
    name: 'guests',
    href: '/dashboard/reports/guests',
    icon: PieChart,
    color: 'bg-[rgba(135,168,120,0.15)] text-[var(--color-sage-dark)]',
    description: 'Guest demographics and behavior analysis',
    comingSoon: true,
  },
  {
    name: 'custom',
    href: '/dashboard/reports/custom',
    icon: FileText,
    color: 'bg-[var(--color-cream)] text-[var(--foreground-muted)]',
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
        <h1 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('title')}</h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          const content = (
            <div className="relative h-full overflow-hidden rounded-xl bg-[var(--background-elevated)] px-6 py-8 shadow-[var(--shadow-soft)] border border-[var(--color-sand)] hover:shadow-[var(--shadow-medium)] hover:-translate-y-0.5 transition-all duration-200">
              <div className={`inline-flex rounded-xl p-3 ${category.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-serif text-lg font-medium text-[var(--foreground)]">
                {t(`categories.${category.name}.title`)}
              </h3>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                {category.description}
              </p>
              {category.comingSoon && (
                <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-[var(--color-cream)] px-3 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                  Coming Soon
                </span>
              )}
              {!category.comingSoon && (
                <div className="mt-6">
                  <span className="text-sm font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)]">
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

      <div className="bg-gradient-to-r from-[var(--color-cream)] to-[rgba(196,164,132,0.1)] border border-[var(--color-sand)] rounded-xl p-6">
        <div className="flex items-start">
          <FileText className="h-6 w-6 text-[var(--color-terracotta)] mt-1" />
          <div className="ml-4">
            <h3 className="font-serif text-lg font-medium text-[var(--foreground)]">
              {t('exportData.title')}
            </h3>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              {t('exportData.description')}
            </p>
            <button className="mt-4 inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-[var(--color-pearl)] bg-[var(--color-charcoal)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200">
              {t('exportData.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
