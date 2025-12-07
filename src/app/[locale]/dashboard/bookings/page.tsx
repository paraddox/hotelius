import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Search, Filter, Eye } from 'lucide-react';
import Link from 'next/link';
import ExportButton from './components/ExportButton';

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
  confirmed: 'bg-[rgba(74,124,89,0.1)] text-[var(--color-success)]',
  pending: 'bg-[rgba(196,164,132,0.15)] text-[var(--color-terracotta)]',
  checked_in: 'bg-[rgba(135,168,120,0.1)] text-[var(--color-sage)]',
  checked_out: 'bg-[var(--color-cream)] text-[var(--foreground-muted)]',
  cancelled: 'bg-[rgba(196,92,92,0.1)] text-[var(--color-error)]',
};

const paymentStatusColors = {
  paid: 'bg-[rgba(74,124,89,0.1)] text-[var(--color-success)]',
  pending: 'bg-[rgba(196,164,132,0.15)] text-[var(--color-terracotta)]',
  refunded: 'bg-[var(--color-cream)] text-[var(--foreground-muted)]',
  failed: 'bg-[rgba(196,92,92,0.1)] text-[var(--color-error)]',
};

export default async function BookingsPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.bookings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('title')}</h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
        <ExportButton label={t('actions.export')} />
      </div>

      {/* Filters */}
      <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  className="block w-full rounded-lg border border-[var(--color-sand)] bg-[var(--background)] pl-10 pr-3 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <select className="block w-full rounded-lg border border-[var(--color-sand)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150 sm:text-sm">
                <option value="">{t('filters.allStatuses')}</option>
                <option value="confirmed">{t('statuses.confirmed')}</option>
                <option value="pending">{t('statuses.pending')}</option>
                <option value="checked_in">{t('statuses.checkedIn')}</option>
                <option value="checked_out">{t('statuses.checkedOut')}</option>
                <option value="cancelled">{t('statuses.cancelled')}</option>
              </select>
            </div>

            <div>
              <select className="block w-full rounded-lg border border-[var(--color-sand)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150 sm:text-sm">
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
      <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-sand)]">
            <thead className="bg-[var(--color-cream)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.bookingId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.guest')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.room')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.checkIn')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.checkOut')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.payment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.total')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--background-elevated)] divide-y divide-[var(--color-sand)]">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[var(--color-cream)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[var(--foreground)]">{booking.id}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{booking.createdAt}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[var(--foreground)]">{booking.guestName}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--foreground)]">{booking.roomType}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">Room {booking.roomNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                    {booking.checkIn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">
                    ${booking.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] transition-colors"
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
        <div className="bg-[var(--background-elevated)] px-4 py-3 border-t border-[var(--color-sand)] sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--foreground-muted)]">
              {t('pagination.showing')} <span className="font-medium text-[var(--foreground)]">1</span> {t('pagination.to')}{' '}
              <span className="font-medium text-[var(--foreground)]">5</span> {t('pagination.of')}{' '}
              <span className="font-medium text-[var(--foreground)]">5</span> {t('pagination.results')}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled
                className="relative inline-flex items-center rounded-lg bg-[var(--background-elevated)] px-3 py-2 text-sm font-medium text-[var(--foreground)] border border-[var(--color-sand)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('pagination.previous')}
              </button>
              <button
                type="button"
                disabled
                className="relative inline-flex items-center rounded-lg bg-[var(--background-elevated)] px-3 py-2 text-sm font-medium text-[var(--foreground)] border border-[var(--color-sand)] hover:bg-[var(--color-cream)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
