import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, ArrowLeft } from 'lucide-react';
import RoomCard from '@/components/booking/RoomCard';
import SearchWidget from '@/components/booking/SearchWidget';

interface SearchParams {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  roomType?: string;
}

// Mock function to check availability - replace with actual API call
async function checkAvailability(
  hotelId: string,
  checkIn?: string,
  checkOut?: string,
  guests?: string
) {
  // TODO: Replace with actual API call to /api/hotels/[hotelId]/availability
  return [
    {
      id: '1',
      name: 'Deluxe Room',
      description: 'Spacious room with city views and modern amenities',
      price: 150,
      image: '/room-1.jpg',
      maxGuests: 2,
      size: 35,
      beds: '1 King Bed',
      amenities: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar'],
      available: 5,
    },
    {
      id: '2',
      name: 'Executive Suite',
      description: 'Luxury suite with separate living area and premium furnishings',
      price: 280,
      image: '/room-2.jpg',
      maxGuests: 4,
      size: 65,
      beds: '1 King Bed + 1 Sofa Bed',
      amenities: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Coffee Maker', 'Work Desk'],
      available: 3,
    },
    {
      id: '3',
      name: 'Presidential Suite',
      description: 'Ultimate luxury with panoramic views and exclusive services',
      price: 500,
      image: '/room-3.jpg',
      maxGuests: 4,
      size: 120,
      beds: '2 King Beds',
      amenities: [
        'Free WiFi',
        'Air Conditioning',
        'Flat-screen TV',
        'Mini Bar',
        'Coffee Maker',
        'Work Desk',
        'Butler Service',
        'Private Balcony',
      ],
      available: 1,
    },
  ];
}

async function getHotelName(slug: string) {
  // TODO: Replace with actual API call
  return 'Grand Plaza Hotel';
}

export default async function RoomsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale, slug } = await params;
  const search = await searchParams;

  const hotelName = await getHotelName(slug);
  const rooms = await checkAvailability(
    slug,
    search.checkIn,
    search.checkOut,
    search.guests
  );

  if (!rooms) {
    notFound();
  }

  const checkInDate = search.checkIn ? new Date(search.checkIn) : null;
  const checkOutDate = search.checkOut ? new Date(search.checkOut) : null;
  const guestCount = search.guests ? parseInt(search.guests) : 1;

  const nights =
    checkInDate && checkOutDate
      ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            href={`/${locale}/hotels/${slug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to hotel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotelName}</h1>
          {checkInDate && checkOutDate && (
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()}
                </span>
                <span className="text-gray-500">({nights} {nights === 1 ? 'night' : 'nights'})</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room List */}
          <div className="lg:col-span-2 space-y-6">
            {!checkInDate || !checkOutDate ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800">
                  Please select check-in and check-out dates to see available rooms and pricing.
                </p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600 text-lg">
                  No rooms available for the selected dates. Please try different dates.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Available Rooms ({rooms.length})
                  </h2>
                </div>

                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    nights={nights}
                    checkIn={checkInDate}
                    checkOut={checkOutDate}
                    guests={guestCount}
                    locale={locale}
                    hotelSlug={slug}
                  />
                ))}
              </>
            )}
          </div>

          {/* Right Column - Search Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <SearchWidget
                hotelId={slug}
                defaultCheckIn={search.checkIn}
                defaultCheckOut={search.checkOut}
                defaultGuests={search.guests}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
