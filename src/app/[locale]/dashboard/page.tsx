import { requireAuth } from '@/lib/auth/requireAuth';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-700">{t('subtitle')}</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={t('metrics.occupancy')}
          value={`${mockMetrics.occupancy}%`}
          icon={TrendingUp}
          iconColor="text-green-600"
          trend={{ value: 5, isPositive: true }}
          description={t('metrics.occupancyDesc')}
        />
        <MetricCard
          title={t('metrics.revenue')}
          value={`$${mockMetrics.revenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-blue-600"
          description={t('metrics.revenueDesc')}
        />
        <MetricCard
          title={t('metrics.upcomingCheckIns')}
          value={mockMetrics.upcomingCheckIns}
          icon={Calendar}
          iconColor="text-purple-600"
          description={t('metrics.upcomingCheckInsDesc')}
        />
        <MetricCard
          title={t('metrics.totalBookings')}
          value={mockMetrics.totalBookings}
          icon={Users}
          iconColor="text-orange-600"
          description={t('metrics.totalBookingsDesc')}
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {t('recentBookings.title')}
          </h2>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('recentBookings.guest')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('recentBookings.roomType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('recentBookings.checkIn')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('recentBookings.checkOut')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('recentBookings.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('recentBookings.total')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockRecentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.guestName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.roomType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
