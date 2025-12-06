import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin, User, Mail, Phone, Download, XCircle, CheckCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

// Mock function to get booking details - replace with actual API call
async function getBookingDetails(id: string) {
  // TODO: Replace with actual API call
  const bookings: Record<string, any> = {
    '1': {
      id: '1',
      reference: 'BK-ABC123',
      status: 'upcoming',
      hotel: {
        name: 'Grand Plaza Hotel',
        image: '/hotel-1.jpg',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        phone: '+1 (555) 123-4567',
        email: 'info@grandplazahotel.com',
      },
      room: {
        name: 'Deluxe Room',
        type: 'King Bed',
      },
      checkIn: new Date('2025-02-15'),
      checkOut: new Date('2025-02-18'),
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
      bookedAt: new Date('2025-01-10'),
      paymentMethod: 'Visa ending in 4242',
      cancellationPolicy: 'Free cancellation up to 48 hours before check-in',
    },
  };

  return bookings[id] || null;
}

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const booking = await getBookingDetails(id);

  if (!booking) {
    notFound();
  }

  const canCancel = booking.status === 'upcoming' &&
    new Date(booking.checkIn).getTime() - Date.now() > 48 * 60 * 60 * 1000; // 48 hours

  const statusConfig = {
    upcoming: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Link
          href="/en/account/bookings"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to bookings
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Details
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">Reference: {booking.reference}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            {canCancel && (
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <XCircle className="w-4 h-4" />
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hotel & Room Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex gap-6">
          <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
            <Image
              src={booking.hotel.image}
              alt={booking.hotel.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-2">{booking.hotel.name}</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{booking.hotel.address}, {booking.hotel.city}, {booking.hotel.country}</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stay Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Stay Details</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Check-in</span>
              </div>
              <p className="font-semibold text-lg">
                {booking.checkIn.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-600">From 3:00 PM</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Check-out</span>
              </div>
              <p className="font-semibold text-lg">
                {booking.checkOut.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-gray-600">Until 11:00 AM</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">Room Type</p>
              <p className="font-semibold">{booking.room.name}</p>
              <p className="text-sm text-gray-600">{booking.room.type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Guests</p>
              <p className="font-semibold">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold">{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</p>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Guest Information</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm">Name</span>
              </div>
              <p className="font-semibold">
                {booking.guest.firstName} {booking.guest.lastName}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="font-semibold">{booking.guest.email}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Phone className="w-4 h-4" />
                <span className="text-sm">Phone</span>
              </div>
              <p className="font-semibold">{booking.guest.phone}</p>
            </div>

            {booking.specialRequests && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                <p className="font-medium">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Price Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">
              ${(booking.pricing.subtotal / booking.nights).toFixed(2)} x {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
            </span>
            <span className="font-medium">${booking.pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="font-medium">${booking.pricing.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t">
            <span>Total</span>
            <span className="text-blue-600">${booking.pricing.total.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="font-medium">{booking.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Booking Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Booked On</p>
            <p className="font-medium">
              {booking.bookedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cancellation Policy</p>
            <p className="font-medium">{booking.cancellationPolicy}</p>
          </div>
        </div>
      </div>

      {/* Important Information */}
      {booking.status === 'upcoming' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Please bring a valid ID and the credit card used for booking at check-in</li>
            <li>• Check-in time: 3:00 PM | Check-out time: 11:00 AM</li>
            <li>• Contact the hotel directly for any special arrangements</li>
            <li>• {booking.cancellationPolicy}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
