import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Mail, Phone, User, Calendar, CreditCard, MapPin, Edit } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';

// Mock booking detail
const mockBookingDetail = {
  id: 'BK001',
  guestName: 'John Doe',
  email: 'john@example.com',
  phone: '+1 234-567-8900',
  roomType: 'Deluxe Room',
  roomNumber: '201',
  checkIn: '2025-12-10',
  checkInTime: '15:00',
  checkOut: '2025-12-13',
  checkOutTime: '11:00',
  nights: 3,
  adults: 2,
  children: 0,
  status: 'confirmed',
  paymentStatus: 'paid',
  totalAmount: 450,
  paymentMethod: 'Credit Card',
  transactionId: 'txn_1234567890',
  specialRequests: 'Late check-in, non-smoking room',
  createdAt: '2025-11-25 14:30:00',
  confirmedAt: '2025-11-25 14:32:00',
  priceBreakdown: [
    { date: '2025-12-10', rate: 150 },
    { date: '2025-12-11', rate: 150 },
    { date: '2025-12-12', rate: 150 },
  ],
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const t = await getTranslations('dashboard.bookings.detail');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToBookings')}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-medium text-[var(--foreground)]">
              {t('title')} {mockBookingDetail.id}
            </h1>
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Bookings', href: '/dashboard/bookings' },
                { label: mockBookingDetail.id },
              ]}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-4 py-2 text-sm font-medium text-[var(--foreground)] border border-[var(--color-sand)] hover:bg-[var(--color-cream)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
            >
              <Mail className="h-4 w-4" />
              {t('actions.sendEmail')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2 text-sm font-medium text-[var(--color-pearl)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
              {t('actions.edit')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="font-serif text-lg font-medium text-[var(--foreground)] mb-4">{t('sections.guestInfo')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.guestName')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.guestName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.email')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.phone')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.guests')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">
                      {mockBookingDetail.adults} {t('adults')}, {mockBookingDetail.children} {t('children')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="font-serif text-lg font-medium text-[var(--foreground)] mb-4">{t('sections.bookingDetails')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.room')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.roomType}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Room {mockBookingDetail.roomNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.nights')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.nights} {t('nights')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.checkIn')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.checkIn}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{mockBookingDetail.checkInTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-[var(--color-terracotta)] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.checkOut')}</p>
                    <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.checkOut}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">{mockBookingDetail.checkOutTime}</p>
                  </div>
                </div>
              </div>

              {mockBookingDetail.specialRequests && (
                <div className="mt-4 pt-4 border-t border-[var(--color-sand)]">
                  <p className="text-sm font-medium text-[var(--foreground-muted)]">{t('fields.specialRequests')}</p>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{mockBookingDetail.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="font-serif text-lg font-medium text-[var(--foreground)] mb-4">{t('sections.priceBreakdown')}</h2>
              <div className="space-y-2">
                {mockBookingDetail.priceBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">{item.date}</span>
                    <span className="font-medium text-[var(--foreground)]">${item.rate}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-[var(--color-sand)]">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-[var(--foreground)]">{t('fields.total')}</span>
                    <span className="text-base font-semibold text-[var(--color-terracotta)]">${mockBookingDetail.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">{t('fields.status')}</h3>
              <span className="inline-flex rounded-full bg-[rgba(74,124,89,0.1)] px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                {mockBookingDetail.status}
              </span>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-lg bg-[var(--color-charcoal)] px-3 py-2.5 text-sm font-medium text-[var(--color-pearl)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
                >
                  {t('actions.checkIn')}
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-lg bg-[var(--background-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] border border-[var(--color-sand)] hover:bg-[var(--color-cream)] transition-all duration-200"
                >
                  {t('actions.modify')}
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-lg bg-[var(--background-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--color-error)] border border-[var(--color-error)] hover:bg-[rgba(196,92,92,0.1)] transition-all duration-200"
                >
                  {t('actions.cancel')}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">{t('sections.payment')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('fields.paymentStatus')}</p>
                  <span className="inline-flex rounded-full bg-[rgba(74,124,89,0.1)] px-2 py-0.5 text-xs font-semibold text-[var(--color-success)] mt-1">
                    {mockBookingDetail.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('fields.paymentMethod')}</p>
                  <p className="text-sm text-[var(--foreground)] mt-1">{mockBookingDetail.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('fields.transactionId')}</p>
                  <p className="text-sm text-[var(--foreground)] font-mono mt-1">{mockBookingDetail.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('fields.amount')}</p>
                  <p className="text-lg font-semibold text-[var(--color-terracotta)] mt-1">${mockBookingDetail.totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">{t('sections.timeline')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('timeline.created')}</p>
                  <p className="text-sm text-[var(--foreground)] mt-1">{mockBookingDetail.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('timeline.confirmed')}</p>
                  <p className="text-sm text-[var(--foreground)] mt-1">{mockBookingDetail.confirmedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
