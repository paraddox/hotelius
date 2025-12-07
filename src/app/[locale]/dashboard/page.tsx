import { requireAuth } from '@/lib/auth/requireAuth';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

// Mock data - replace with real data from database
const mockMetrics = {
  occupancy: 78,
  revenue: 45280,
  upcomingCheckIns: 12,
  totalBookings: 45,
};

const mockRecentBookings = [
  {
    id: '1',
    guestName: 'John Doe',
    roomType: 'Deluxe Room',
    checkIn: '2025-12-10',
    checkOut: '2025-12-13',
    status: 'confirmed',
    total: 450,
  },
  {
    id: '2',
    guestName: 'Jane Smith',
    roomType: 'Suite',
    checkIn: '2025-12-12',
    checkOut: '2025-12-15',
    status: 'pending',
    total: 720,
  },
  {
    id: '3',
    guestName: 'Bob Johnson',
    roomType: 'Standard Room',
    checkIn: '2025-12-08',
    checkOut: '2025-12-10',
    status: 'checked_in',
    total: 280,
  },
];

export default async function DashboardPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.home');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('title')}</h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('metrics.occupancy')}
          value={`${mockMetrics.occupancy}%`}
          icon={TrendingUp}
          iconColor="text-[var(--color-success)]"
          trend={{ value: 5, isPositive: true }}
          description={t('metrics.occupancyDesc')}
        />
        <MetricCard
          title={t('metrics.revenue')}
          value={`$${mockMetrics.revenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-[var(--color-terracotta)]"
          description={t('metrics.revenueDesc')}
        />
        <MetricCard
          title={t('metrics.upcomingCheckIns')}
          value={mockMetrics.upcomingCheckIns}
          icon={Calendar}
          iconColor="text-[var(--color-sage)]"
          description={t('metrics.upcomingCheckInsDesc')}
        />
        <MetricCard
          title={t('metrics.totalBookings')}
          value={mockMetrics.totalBookings}
          icon={Users}
          iconColor="text-[var(--color-warning)]"
          description={t('metrics.totalBookingsDesc')}
        />
      </div>

      {/* Recent Bookings */}
      <div className="card bg-[var(--background-elevated)] rounded-xl border border-[var(--color-sand)]">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="font-serif text-lg font-medium text-[var(--foreground)] mb-4">
            {t('recentBookings.title')}
          </h2>
          <div className="overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-[var(--color-sand)]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('recentBookings.guest')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('recentBookings.roomType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('recentBookings.checkIn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('recentBookings.checkOut')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('recentBookings.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('recentBookings.total')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-elevated)] divide-y divide-[var(--color-sand)]">
                {mockRecentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[var(--color-cream-dark)] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">
                      {booking.guestName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                      {booking.roomType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                      {booking.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                      {booking.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-[rgba(74,124,89,0.1)] text-[var(--color-success)]'
                            : booking.status === 'pending'
                            ? 'bg-[rgba(212,165,116,0.15)] text-[var(--color-warning)]'
                            : 'bg-[rgba(196,164,132,0.15)] text-[var(--color-terracotta)]'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-terracotta)]">
                      ${booking.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
