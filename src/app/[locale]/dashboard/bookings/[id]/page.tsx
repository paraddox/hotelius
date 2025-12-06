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
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToBookings')}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
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
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <Mail className="h-4 w-4" />
              {t('actions.sendEmail')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
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
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sections.guestInfo')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.guestName')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.guestName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.email')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.phone')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.guests')}</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {mockBookingDetail.adults} {t('adults')}, {mockBookingDetail.children} {t('children')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sections.bookingDetails')}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.room')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.roomType}</p>
                    <p className="text-xs text-gray-500">Room {mockBookingDetail.roomNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.nights')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.nights} {t('nights')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.checkIn')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.checkIn}</p>
                    <p className="text-xs text-gray-500">{mockBookingDetail.checkInTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('fields.checkOut')}</p>
                    <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.checkOut}</p>
                    <p className="text-xs text-gray-500">{mockBookingDetail.checkOutTime}</p>
                  </div>
                </div>
              </div>

              {mockBookingDetail.specialRequests && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500">{t('fields.specialRequests')}</p>
                  <p className="mt-1 text-sm text-gray-900">{mockBookingDetail.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('sections.priceBreakdown')}</h2>
              <div className="space-y-2">
                {mockBookingDetail.priceBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.date}</span>
                    <span className="font-medium text-gray-900">${item.rate}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">{t('fields.total')}</span>
                    <span className="text-base font-semibold text-gray-900">${mockBookingDetail.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">{t('fields.status')}</h3>
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                {mockBookingDetail.status}
              </span>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  {t('actions.checkIn')}
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {t('actions.modify')}
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                >
                  {t('actions.cancel')}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">{t('sections.payment')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">{t('fields.paymentStatus')}</p>
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 mt-1">
                    {mockBookingDetail.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('fields.paymentMethod')}</p>
                  <p className="text-sm text-gray-900 mt-1">{mockBookingDetail.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('fields.transactionId')}</p>
                  <p className="text-sm text-gray-900 font-mono mt-1">{mockBookingDetail.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('fields.amount')}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">${mockBookingDetail.totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">{t('sections.timeline')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">{t('timeline.created')}</p>
                  <p className="text-sm text-gray-900 mt-1">{mockBookingDetail.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('timeline.confirmed')}</p>
                  <p className="text-sm text-gray-900 mt-1">{mockBookingDetail.confirmedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
