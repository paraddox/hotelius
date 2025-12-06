import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Search, Filter, Download, Eye } from 'lucide-react';
import Link from 'next/link';

// Mock bookings data
const mockBookings = [
  {
    id: 'BK001',
    guestName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234-567-8900',
    roomType: 'Deluxe Room',
    roomNumber: '201',
    checkIn: '2025-12-10',
    checkOut: '2025-12-13',
    nights: 3,
    guests: 2,
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 450,
    createdAt: '2025-11-25',
  },
  {
    id: 'BK002',
    guestName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 234-567-8901',
    roomType: 'Suite',
    roomNumber: '305',
    checkIn: '2025-12-12',
    checkOut: '2025-12-15',
    nights: 3,
    guests: 3,
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 720,
    createdAt: '2025-11-28',
  },
  {
    id: 'BK003',
    guestName: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1 234-567-8902',
    roomType: 'Standard Room',
    roomNumber: '105',
    checkIn: '2025-12-08',
    checkOut: '2025-12-10',
    nights: 2,
    guests: 1,
    status: 'checked_in',
    paymentStatus: 'paid',
    totalAmount: 280,
    createdAt: '2025-11-20',
  },
  {
    id: 'BK004',
    guestName: 'Alice Williams',
    email: 'alice@example.com',
    phone: '+1 234-567-8903',
    roomType: 'Deluxe Room',
    roomNumber: '202',
    checkIn: '2025-11-30',
    checkOut: '2025-12-05',
    nights: 5,
    guests: 2,
    status: 'checked_out',
    paymentStatus: 'paid',
    totalAmount: 750,
    createdAt: '2025-11-15',
  },
  {
    id: 'BK005',
    guestName: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '+1 234-567-8904',
    roomType: 'Standard Room',
    roomNumber: '108',
    checkIn: '2025-12-20',
    checkOut: '2025-12-22',
    nights: 2,
    guests: 1,
    status: 'cancelled',
    paymentStatus: 'refunded',
    totalAmount: 280,
    createdAt: '2025-11-10',
  },
];

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  checked_in: 'bg-blue-100 text-blue-800',
  checked_out: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  refunded: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
};

export default async function BookingsPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.bookings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('subtitle')}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          {t('actions.export')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            <div>
              <select className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                <option value="">{t('filters.allStatuses')}</option>
                <option value="confirmed">{t('statuses.confirmed')}</option>
                <option value="pending">{t('statuses.pending')}</option>
                <option value="checked_in">{t('statuses.checkedIn')}</option>
                <option value="checked_out">{t('statuses.checkedOut')}</option>
                <option value="cancelled">{t('statuses.cancelled')}</option>
              </select>
            </div>

            <div>
              <select className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                <option value="">{t('filters.allDates')}</option>
                <option value="today">{t('filters.today')}</option>
                <option value="week">{t('filters.thisWeek')}</option>
                <option value="month">{t('filters.thisMonth')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.bookingId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.guest')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.room')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.checkIn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.checkOut')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.payment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.total')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                    <div className="text-xs text-gray-500">{booking.createdAt}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                    <div className="text-xs text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.roomType}</div>
                    <div className="text-xs text-gray-500">Room {booking.roomNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.checkOut}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[booking.status as keyof typeof statusColors]}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors]}`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${booking.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                      {t('actions.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t('pagination.showing')} <span className="font-medium">1</span> {t('pagination.to')}{' '}
              <span className="font-medium">5</span> {t('pagination.of')}{' '}
              <span className="font-medium">5</span> {t('pagination.results')}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.previous')}
              </button>
              <button
                type="button"
                disabled
                className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('pagination.next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
