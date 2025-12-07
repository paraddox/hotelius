import Link from 'next/link';
import { Metadata } from 'next';
import { CheckCircle, Calendar, MapPin, User, Mail, Phone, Download, Home } from 'lucide-react';
import { generateBookingMetadata } from '@/lib/seo/metadata';

interface SearchParams {
  bookingId?: string;
  bookingReference?: string;
}

// Generate metadata for SEO (noindex for confirmation pages)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  // Use a generic hotel name for confirmation page
  // In production, fetch the actual hotel name from the booking
  return generateBookingMetadata('Your Booking', 'confirmation');
}

// Mock function to get booking details - replace with actual API call
async function getBookingDetails(bookingId: string) {
  // TODO: Replace with actual API call
  return {
    id: bookingId,
    reference: 'BK-' + bookingId.toUpperCase().slice(0, 8),
    status: 'confirmed',
    hotel: {
      name: 'Grand Plaza Hotel',
      address: '123 Main Street, Downtown',
      city: 'New York',
      country: 'USA',
      phone: '+1 (555) 123-4567',
      email: 'info@grandplazahotel.com',
    },
    room: {
      name: 'Deluxe Room',
      type: 'King Bed',
    },
    checkIn: new Date('2025-01-15'),
    checkOut: new Date('2025-01-18'),
    guests: 2,
    guest: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 987-6543',
    },
    pricing: {
      subtotal: 450,
      tax: 45,
      total: 495,
    },
    nights: 3,
    specialRequests: 'Late check-in after 10 PM',
    createdAt: new Date(),
  };
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const search = await searchParams;

  // In production, get bookingId from API response after payment
  const bookingId = search.bookingId || 'demo-booking-id';
  const booking = await getBookingDetails(bookingId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your reservation. A confirmation email has been sent to{' '}
              <span className="font-medium">{booking.guest.email}</span>
            </p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-6 py-3">
              <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
              <p className="text-2xl font-bold text-blue-600">{booking.reference}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-semibold mb-6">Booking Details</h2>

            {/* Hotel Information */}
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">{booking.hotel.name}</h3>
                  <p className="text-gray-600">
                    {booking.hotel.address}, {booking.hotel.city}, {booking.hotel.country}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{booking.hotel.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{booking.hotel.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Check-in</span>
                </div>
                <p className="text-lg font-semibold">
                  {booking.checkIn.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600">From 3:00 PM</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Check-out</span>
                </div>
                <p className="text-lg font-semibold">
                  {booking.checkOut.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600">Until 11:00 AM</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Room Type</span>
                </div>
                <p className="text-lg font-semibold">{booking.room.name}</p>
                <p className="text-sm text-gray-600">{booking.room.type}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Guests</span>
                </div>
                <p className="text-lg font-semibold">
                  {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                </p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-lg mb-3">Guest Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-medium">
                    {booking.guest.firstName} {booking.guest.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{booking.guest.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium">{booking.guest.phone}</p>
                </div>
                {booking.specialRequests && (
                  <div className="md:col-span-2">
                    <p className="text-gray-600">Special Requests</p>
                    <p className="font-medium">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Price Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    ${booking.pricing.subtotal / booking.nights} x {booking.nights}{' '}
                    {booking.nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span className="font-medium">${booking.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">${booking.pricing.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">${booking.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5" />
              Download Confirmation
            </button>
            <Link
              href={`/${locale}/account/bookings/${booking.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
              View in My Bookings
            </Link>
          </div>

          {/* Home Link */}
          <div className="text-center mt-8">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Link>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="font-semibold text-lg mb-3">Important Information</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Please bring a valid ID and the credit card used for booking at check-in</li>
              <li>• Check-in time: 3:00 PM | Check-out time: 11:00 AM</li>
              <li>• Free cancellation up to 48 hours before check-in</li>
              <li>• For any changes or assistance, contact the hotel directly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
