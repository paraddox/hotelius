import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Lock } from 'lucide-react';
import PaymentForm from '@/components/booking/PaymentForm';
import BookingSummary from '@/components/booking/BookingSummary';
import { generateBookingMetadata } from '@/lib/seo/metadata';

interface SearchParams {
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialRequests?: string;
}

// Mock function to get room details - replace with actual API call
async function getRoomDetails(hotelSlug: string, roomId: string) {
  // TODO: Replace with actual API call
  const rooms: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Deluxe Room',
      description: 'Spacious room with city views',
      price: 150,
      image: '/room-1.jpg',
      maxGuests: 2,
    },
    '2': {
      id: '2',
      name: 'Executive Suite',
      description: 'Luxury suite with separate living area',
      price: 280,
      image: '/room-2.jpg',
      maxGuests: 4,
    },
    '3': {
      id: '3',
      name: 'Presidential Suite',
      description: 'Ultimate luxury with panoramic views',
      price: 500,
      image: '/room-3.jpg',
      maxGuests: 4,
    },
  };

  return rooms[roomId] || null;
}

async function getHotelName(slug: string) {
  // TODO: Replace with actual API call
  return 'Grand Plaza Hotel';
}

// Generate metadata for SEO (noindex for payment pages)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotelName = await getHotelName(slug);

  return generateBookingMetadata(hotelName, 'payment');
}

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, slug } = await params;
  const search = await searchParams;

  // Validate required params
  if (
    !search.roomId ||
    !search.checkIn ||
    !search.checkOut ||
    !search.guests ||
    !search.firstName ||
    !search.lastName ||
    !search.email ||
    !search.phone
  ) {
    redirect(`/${locale}/hotels/${slug}/rooms`);
  }

  const room = await getRoomDetails(slug, search.roomId);
  const hotelName = await getHotelName(slug);

  if (!room) {
    notFound();
  }

  const checkInDate = new Date(search.checkIn);
  const checkOutDate = new Date(search.checkOut);
  const guestCount = parseInt(search.guests);

  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const subtotal = room.price * nights;
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const guestInfo = {
    firstName: search.firstName,
    lastName: search.lastName,
    email: search.email,
    phone: search.phone,
    specialRequests: search.specialRequests,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/${locale}/hotels/${slug}/book?roomId=${search.roomId}&checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`}
            className="inline-flex items-center gap-2 text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to guest details
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-serif font-bold text-[var(--foreground)]">Payment</h1>
            <Lock className="w-6 h-6 text-[var(--color-success)]" />
          </div>
          <p className="text-[var(--foreground-muted)]">Your payment is secure and encrypted</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
              <PaymentForm
                hotelSlug={slug}
                roomId={search.roomId}
                checkIn={search.checkIn}
                checkOut={search.checkOut}
                guests={search.guests}
                guestInfo={guestInfo}
                total={total}
                locale={locale}
              />
            </div>

            {/* Guest Information Summary */}
            <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-xl font-serif font-semibold mb-4">Guest Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[var(--foreground-muted)]">Name</p>
                  <p className="font-medium">{search.firstName} {search.lastName}</p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Email</p>
                  <p className="font-medium">{search.email}</p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)]">Phone</p>
                  <p className="font-medium">{search.phone}</p>
                </div>
                {search.specialRequests && (
                  <div className="col-span-2">
                    <p className="text-[var(--foreground-muted)]">Special Requests</p>
                    <p className="font-medium">{search.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <BookingSummary
              hotelName={hotelName}
              room={room}
              checkIn={checkInDate}
              checkOut={checkOutDate}
              guests={guestCount}
              nights={nights}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
