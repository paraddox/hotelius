import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, Users, MapPin, Star, Wifi, Coffee, Utensils, Dumbbell, Phone, Mail } from 'lucide-react';
import SearchWidget from '@/components/booking/SearchWidget';
import { generateHotelMetadata, generateHotelStructuredData } from '@/lib/seo/metadata';

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
    state: 'NY',
    country: 'USA',
    zipCode: '10001',
    phone: '+1 (555) 123-4567',
    email: 'info@grandplazahotel.com',
    rating: 4.8,
    reviewCount: 1234,
    images: [
      '/hotel-1.jpg',
      '/hotel-2.jpg',
      '/hotel-3.jpg',
      '/hotel-4.jpg',
    ],
    amenities: [
      { id: '1', name: 'Free WiFi', icon: 'wifi', category: 'general' as const },
      { id: '2', name: 'Breakfast Included', icon: 'coffee', category: 'dining' as const },
      { id: '3', name: 'Restaurant & Bar', icon: 'utensils', category: 'dining' as const },
      { id: '4', name: 'Fitness Center', icon: 'dumbbell', category: 'recreation' as const },
    ],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
    createdAt: new Date(),
    updatedAt: new Date(),
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

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const hotel = await getHotel(slug);

  if (!hotel) {
    return {
      title: 'Hotel Not Found',
    };
  }

  return generateHotelMetadata(hotel, locale);
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

  // Generate structured data for search engines
  const structuredData = generateHotelStructuredData(hotel, locale);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section with Image Gallery */}
      <div className="bg-[var(--background-elevated)]">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-2 h-[500px]">
            <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden">
              <Image
                src={hotel.images[0]}
                alt={hotel.name}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {hotel.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden bg-[var(--color-sand)]">
                <Image
                  src={image}
                  alt={`${hotel.name} - Photo ${index + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
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
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-2">
                <MapPin className="w-4 h-4" />
                <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
              </div>
              <h1 className="font-serif text-4xl font-medium text-[var(--foreground)] mb-3">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                  <span className="font-semibold text-[var(--foreground)]">{hotel.rating}</span>
                  <span className="text-[var(--foreground-muted)]">({hotel.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card bg-[var(--background-elevated)] rounded-xl p-6 border border-[var(--color-sand)]">
              <h2 className="font-serif text-2xl font-medium text-[var(--foreground)] mb-4">About this hotel</h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <div className="card bg-[var(--background-elevated)] rounded-xl p-6 border border-[var(--color-sand)]">
              <h2 className="font-serif text-2xl font-medium text-[var(--foreground)] mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Wifi className="w-5 h-5 text-[var(--color-terracotta)]" />
                  <span>Free WiFi</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Coffee className="w-5 h-5 text-[var(--color-terracotta)]" />
                  <span>Breakfast Included</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Utensils className="w-5 h-5 text-[var(--color-terracotta)]" />
                  <span>Restaurant & Bar</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Dumbbell className="w-5 h-5 text-[var(--color-terracotta)]" />
                  <span>Fitness Center</span>
                </div>
              </div>
            </div>

            {/* Room Types */}
            <div className="card bg-[var(--background-elevated)] rounded-xl p-6 border border-[var(--color-sand)]">
              <h2 className="font-serif text-2xl font-medium text-[var(--foreground)] mb-6">Available Rooms</h2>
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-[var(--color-sand)] rounded-xl p-4 hover:border-[var(--color-terracotta)] hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-sand)]">
                        <Image
                          src={room.image}
                          alt={room.name}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-medium text-[var(--foreground)] mb-2">{room.name}</h3>
                        <p className="text-[var(--foreground-muted)] mb-3">{room.description}</p>
                        <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-4">
                          <Users className="w-4 h-4" />
                          <span>Max {room.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-serif text-3xl font-medium text-[var(--color-terracotta)]">
                              ${room.price}
                            </span>
                            <span className="text-[var(--foreground-muted)]"> / night</span>
                          </div>
                          <Link
                            href={`/${locale}/hotels/${slug}/rooms?roomType=${room.id}`}
                            className="px-6 py-2.5 bg-[var(--color-charcoal)] text-[var(--color-pearl)] rounded-lg hover:bg-[var(--color-slate)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md font-medium"
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
            <div className="card bg-[var(--background-elevated)] rounded-xl p-6 border border-[var(--color-sand)]">
              <h2 className="font-serif text-2xl font-medium text-[var(--foreground)] mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                  <Phone className="w-5 h-5 text-[var(--color-terracotta)]" />
                  <span>{hotel.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
                  <Mail className="w-5 h-5 text-[var(--color-terracotta)]" />
                  <span>{hotel.email}</span>
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
