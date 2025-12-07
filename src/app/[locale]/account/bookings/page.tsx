import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, ChevronRight, Clock } from 'lucide-react';

// Mock bookings data - replace with actual data fetching
async function getUserBookings() {
  // TODO: Replace with actual API call
  return [
    {
      id: '1',
      reference: 'BK-ABC123',
      status: 'upcoming',
      hotel: {
        name: 'Grand Plaza Hotel',
        image: '/hotel-1.jpg',
        address: '123 Main Street, New York, USA',
      },
      room: {
        name: 'Deluxe Room',
        type: 'King Bed',
      },
      checkIn: new Date('2025-02-15'),
      checkOut: new Date('2025-02-18'),
      guests: 2,
      nights: 3,
      total: 495,
      bookedAt: new Date('2025-01-10'),
    },
    {
      id: '2',
      reference: 'BK-DEF456',
      status: 'upcoming',
      hotel: {
        name: 'Seaside Resort',
        image: '/hotel-2.jpg',
        address: '456 Beach Road, Miami, USA',
      },
      room: {
        name: 'Ocean View Suite',
        type: '2 Queen Beds',
      },
      checkIn: new Date('2025-03-20'),
      checkOut: new Date('2025-03-25'),
      guests: 4,
      nights: 5,
      total: 1250,
      bookedAt: new Date('2025-01-15'),
    },
    {
      id: '3',
      reference: 'BK-GHI789',
      status: 'completed',
      hotel: {
        name: 'Mountain Lodge',
        image: '/hotel-3.jpg',
        address: '789 Alpine Drive, Aspen, USA',
      },
      room: {
        name: 'Chalet Room',
        type: 'King Bed',
      },
      checkIn: new Date('2024-12-15'),
      checkOut: new Date('2024-12-20'),
      guests: 2,
      nights: 5,
      total: 875,
      bookedAt: new Date('2024-11-20'),
    },
    {
      id: '4',
      reference: 'BK-JKL012',
      status: 'cancelled',
      hotel: {
        name: 'City Center Hotel',
        image: '/hotel-4.jpg',
        address: '321 Downtown Ave, Chicago, USA',
      },
      room: {
        name: 'Standard Room',
        type: 'Queen Bed',
      },
      checkIn: new Date('2024-11-10'),
      checkOut: new Date('2024-11-12'),
      guests: 1,
      nights: 2,
      total: 280,
      bookedAt: new Date('2024-10-15'),
      cancelledAt: new Date('2024-11-05'),
    },
  ];
}

const statusConfig = {
  upcoming: {
    label: 'Upcoming',
    color: 'bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]',
  },
  completed: {
    label: 'Completed',
    color: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
  },
};

export default async function BookingsPage() {
  const bookings = await getUserBookings();

  const upcomingBookings = bookings.filter((b) => b.status === 'upcoming');
  const pastBookings = bookings.filter((b) => b.status !== 'upcoming');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">My Bookings</h1>
        <p className="text-[var(--foreground-muted)]">View and manage your reservations</p>
      </div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-semibold mb-4 text-[var(--foreground)]">Upcoming Trips</h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-semibold mb-4 text-[var(--foreground)]">Past & Cancelled</h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookings.length === 0 && (
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-[var(--foreground-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-serif font-semibold text-[var(--foreground)] mb-2">
            No bookings yet
          </h3>
          <p className="text-[var(--foreground-muted)] mb-6">
            Start planning your next adventure!
          </p>
          <Link
            href="/en"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-charcoal)] text-[var(--color-pearl)] rounded-lg hover:opacity-90 transition-all"
          >
            Browse Hotels
          </Link>
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const status = statusConfig[booking.status as keyof typeof statusConfig];

  return (
    <Link href={`/en/account/bookings/${booking.id}`}>
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm border border-[var(--color-sand)] hover:shadow-md transition-all overflow-hidden">
        <div className="md:flex">
          {/* Hotel Image */}
          <div className="md:w-1/4 relative h-48 md:h-auto bg-[var(--color-sand)]/20">
            <Image
              src={booking.hotel.image}
              alt={booking.hotel.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="md:w-3/4 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-serif font-semibold text-[var(--foreground)] mb-1">
                  {booking.hotel.name}
                </h3>
                <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.hotel.address}</span>
                </div>
                <p className="text-[var(--foreground-muted)]">{booking.room.name}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-[var(--foreground-muted)]" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="flex items-center gap-1 text-[var(--foreground-muted)] text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Check-in</span>
                </div>
                <p className="font-medium text-[var(--foreground)]">
                  {booking.checkIn.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[var(--foreground-muted)] text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Check-out</span>
                </div>
                <p className="font-medium text-[var(--foreground)]">
                  {booking.checkOut.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[var(--foreground-muted)] text-sm mb-1">
                  <Users className="w-4 h-4" />
                  <span>Guests</span>
                </div>
                <p className="font-medium text-[var(--foreground)]">{booking.guests}</p>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[var(--foreground-muted)] text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Nights</span>
                </div>
                <p className="font-medium text-[var(--foreground)]">{booking.nights}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-sand)]">
              <div>
                <p className="text-sm text-[var(--foreground-muted)]">Booking Reference</p>
                <p className="font-mono font-medium text-[var(--foreground)]">{booking.reference}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--foreground-muted)]">Total Paid</p>
                <p className="text-xl font-bold text-[var(--foreground)]">
                  ${booking.total.toFixed(2)}
                </p>
              </div>
            </div>

            {booking.cancelledAt && (
              <div className="mt-4 pt-4 border-t border-[var(--color-sand)]">
                <p className="text-sm text-[var(--foreground-muted)]">
                  Cancelled on{' '}
                  {booking.cancelledAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
