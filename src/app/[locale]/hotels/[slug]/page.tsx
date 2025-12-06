import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Users, MapPin, Star, Wifi, Coffee, Utensils, Dumbbell, Phone, Mail } from 'lucide-react';
import SearchWidget from '@/components/booking/SearchWidget';

// Mock data - replace with actual data fetching
async function getHotel(slug: string) {
  // TODO: Replace with actual API call
  return {
    id: '1',
    slug: slug,
    name: 'Grand Plaza Hotel',
    description: 'Experience luxury and comfort in the heart of the city. Our hotel offers world-class amenities, stunning views, and exceptional service to make your stay unforgettable.',
    address: '123 Main Street, Downtown',
    city: 'New York',
    country: 'USA',
    rating: 4.8,
    reviewCount: 1234,
    images: [
      '/hotel-1.jpg',
      '/hotel-2.jpg',
      '/hotel-3.jpg',
      '/hotel-4.jpg',
    ],
    amenities: [
      { icon: Wifi, name: 'Free WiFi' },
      { icon: Coffee, name: 'Breakfast Included' },
      { icon: Utensils, name: 'Restaurant & Bar' },
      { icon: Dumbbell, name: 'Fitness Center' },
    ],
    rooms: [
      {
        id: '1',
        name: 'Deluxe Room',
        description: 'Spacious room with city views',
        price: 150,
        image: '/room-1.jpg',
        maxGuests: 2,
      },
      {
        id: '2',
        name: 'Executive Suite',
        description: 'Luxury suite with separate living area',
        price: 280,
        image: '/room-2.jpg',
        maxGuests: 4,
      },
      {
        id: '3',
        name: 'Presidential Suite',
        description: 'Ultimate luxury with panoramic views',
        price: 500,
        image: '/room-3.jpg',
        maxGuests: 4,
      },
    ],
  };
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const hotel = await getHotel(slug);

  if (!hotel) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Gallery */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-2 h-[500px]">
            <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
              <Image
                src={hotel.images[0]}
                alt={hotel.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            {hotel.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={image}
                  alt={`${hotel.name} - Photo ${index + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hotel Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{hotel.rating}</span>
                  <span className="text-gray-600">({hotel.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">About this hotel</h2>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <amenity.icon className="w-5 h-5 text-blue-600" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Types */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        <Image
                          src={room.image}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                        <p className="text-gray-600 mb-3">{room.description}</p>
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <Users className="w-4 h-4" />
                          <span>Max {room.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-3xl font-bold text-gray-900">
                              ${room.price}
                            </span>
                            <span className="text-gray-600"> / night</span>
                          </div>
                          <Link
                            href={`/${locale}/hotels/${slug}/rooms?roomType=${room.id}`}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Select
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>info@grandplazahotel.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Search Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <SearchWidget hotelId={hotel.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
