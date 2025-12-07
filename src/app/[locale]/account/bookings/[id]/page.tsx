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
    upcoming: { label: 'Confirmed', color: 'bg-[var(--color-success)]/10 text-[var(--color-success)]', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-[var(--color-error)]/10 text-[var(--color-error)]', icon: XCircle },
  };

  const status = statusConfig[booking.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <Link
          href="/en/account/bookings"
          className="inline-flex items-center gap-2 text-[var(--color-terracotta)] hover:opacity-80 mb-4 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to bookings
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">
              Booking Details
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-[var(--foreground-muted)]">Reference: {booking.reference}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-[var(--color-sand)] text-[var(--foreground)] rounded-lg hover:bg-[var(--color-sand)]/20 transition-all">
              <Download className="w-4 h-4" />
              Download
            </button>
            {canCancel && (
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-error)] text-[var(--color-pearl)] rounded-lg hover:opacity-90 transition-all">
                <XCircle className="w-4 h-4" />
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hotel & Room Info */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <div className="flex gap-6">
          <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-sand)]/20">
            <Image
              src={booking.hotel.image}
              alt={booking.hotel.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-serif font-semibold mb-2 text-[var(--foreground)]">{booking.hotel.name}</h2>
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-3">
              <MapPin className="w-4 h-4" />
              <span>{booking.hotel.address}, {booking.hotel.city}, {booking.hotel.country}</span>
            </div>
            <div className="flex gap-4 text-sm text-[var(--foreground-muted)]">
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
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-serif font-semibold mb-4 text-[var(--foreground)]">Stay Details</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Check-in</span>
              </div>
              <p className="font-semibold text-lg text-[var(--foreground)]">
                {booking.checkIn.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">From 3:00 PM</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Check-out</span>
              </div>
              <p className="font-semibold text-lg text-[var(--foreground)]">
                {booking.checkOut.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-sm text-[var(--foreground-muted)]">Until 11:00 AM</p>
            </div>

            <div className="pt-4 border-t border-[var(--color-sand)]">
              <p className="text-sm text-[var(--foreground-muted)] mb-1">Room Type</p>
              <p className="font-semibold text-[var(--foreground)]">{booking.room.name}</p>
              <p className="text-sm text-[var(--foreground-muted)]">{booking.room.type}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--foreground-muted)] mb-1">Guests</p>
              <p className="font-semibold text-[var(--foreground)]">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
            </div>

            <div>
              <p className="text-sm text-[var(--foreground-muted)] mb-1">Duration</p>
              <p className="font-semibold text-[var(--foreground)]">{booking.nights} {booking.nights === 1 ? 'night' : 'nights'}</p>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-serif font-semibold mb-4 text-[var(--foreground)]">Guest Information</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm">Name</span>
              </div>
              <p className="font-semibold text-[var(--foreground)]">
                {booking.guest.firstName} {booking.guest.lastName}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="font-semibold text-[var(--foreground)]">{booking.guest.email}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
                <Phone className="w-4 h-4" />
                <span className="text-sm">Phone</span>
              </div>
              <p className="font-semibold text-[var(--foreground)]">{booking.guest.phone}</p>
            </div>

            {booking.specialRequests && (
              <div className="pt-4 border-t border-[var(--color-sand)]">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">Special Requests</p>
                <p className="font-medium text-[var(--foreground)]">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-serif font-semibold mb-4 text-[var(--foreground)]">Price Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[var(--foreground-muted)]">
              ${(booking.pricing.subtotal / booking.nights).toFixed(2)} x {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
            </span>
            <span className="font-medium text-[var(--foreground)]">${booking.pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--foreground-muted)]">Taxes & Fees</span>
            <span className="font-medium text-[var(--foreground)]">${booking.pricing.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-[var(--color-sand)]">
            <span className="text-[var(--foreground)]">Total</span>
            <span className="text-[var(--color-terracotta)]">${booking.pricing.total.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-[var(--color-sand)]">
            <p className="text-sm text-[var(--foreground-muted)]">Payment Method</p>
            <p className="font-medium text-[var(--foreground)]">{booking.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Booking Info */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-serif font-semibold mb-4 text-[var(--foreground)]">Booking Information</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-[var(--foreground-muted)]">Booked On</p>
            <p className="font-medium text-[var(--foreground)]">
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
            <p className="text-sm text-[var(--foreground-muted)]">Cancellation Policy</p>
            <p className="font-medium text-[var(--foreground)]">{booking.cancellationPolicy}</p>
          </div>
        </div>
      </div>

      {/* Important Information */}
      {booking.status === 'upcoming' && (
        <div className="bg-[var(--color-terracotta)]/5 border border-[var(--color-terracotta)]/20 rounded-xl p-6">
          <h3 className="font-serif font-semibold text-lg mb-3 text-[var(--foreground)]">Important Information</h3>
          <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
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
