import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import GuestForm from '@/components/booking/GuestForm';
import BookingSummary from '@/components/booking/BookingSummary';
import { generateBookingMetadata } from '@/lib/seo/metadata';

interface SearchParams {
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
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

// Generate metadata for SEO (noindex for checkout pages)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hotelName = await getHotelName(slug);

  return generateBookingMetadata(hotelName, 'guest');
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, slug } = await params;
  const search = await searchParams;

  // Validate required params
  if (!search.roomId || !search.checkIn || !search.checkOut || !search.guests) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/${locale}/hotels/${slug}/rooms?checkIn=${search.checkIn}&checkOut=${search.checkOut}&guests=${search.guests}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to rooms
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Guest Details</h1>
          <p className="text-gray-600">Please provide your information to complete the booking</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Guest Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <GuestForm
                hotelSlug={slug}
                roomId={search.roomId}
                checkIn={search.checkIn}
                checkOut={search.checkOut}
                guests={search.guests}
                locale={locale}
              />
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
