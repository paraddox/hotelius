import Image from 'next/image';
import Link from 'next/link';
import { Users, Square, Bed, Wifi, Coffee, Tv, Wind } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  maxGuests: number;
  size: number;
  beds: string;
  amenities: string[];
  available: number;
}

interface RoomCardProps {
  room: Room;
  nights: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  locale: string;
  hotelSlug: string;
}

const amenityIcons: Record<string, any> = {
  'Free WiFi': Wifi,
  'Air Conditioning': Wind,
  'Flat-screen TV': Tv,
  'Coffee Maker': Coffee,
};

export default function RoomCard({
  room,
  nights,
  checkIn,
  checkOut,
  guests,
  locale,
  hotelSlug,
}: RoomCardProps) {
  const totalPrice = room.price * nights;

  const bookingUrl = new URLSearchParams({
    roomId: room.id,
    checkIn: checkIn.toISOString().split('T')[0],
    checkOut: checkOut.toISOString().split('T')[0],
    guests: guests.toString(),
  });

  return (
    <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm border border-[var(--color-sand)] overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="md:flex">
        {/* Room Image */}
        <div className="md:w-1/3 relative h-64 md:h-auto bg-[var(--background)]">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className="object-cover"
          />
          {room.available <= 3 && (
            <div className="absolute top-4 left-4 bg-[var(--color-error)] text-white px-3 py-1 rounded-full text-sm font-medium">
              Only {room.available} left
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[var(--foreground)] mb-2">
                {room.name}
              </h3>
              <p className="text-[var(--foreground-muted)] mb-4">{room.description}</p>
            </div>
          </div>

          {/* Room Features */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-[var(--foreground-muted)]">
            <div className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              <span>{room.size} m²</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4" />
              <span>{room.beds}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Max {room.maxGuests} guests</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 6).map((amenity, index) => {
                const Icon = amenityIcons[amenity];
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] bg-[var(--background)] px-3 py-1 rounded-full"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{amenity}</span>
                  </div>
                );
              })}
              {room.amenities.length > 6 && (
                <span className="text-sm text-[var(--color-terracotta)]">
                  +{room.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Pricing and CTA */}
          <div className="flex items-end justify-between pt-4 border-t border-[var(--color-sand)]">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-[var(--foreground)]">
                  ${room.price}
                </span>
                <span className="text-[var(--foreground-muted)]">/ night</span>
              </div>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                ${totalPrice} total for {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
              <p className="text-xs text-[var(--foreground-muted)] opacity-70 mt-1">Excludes taxes & fees</p>
            </div>
            <Link
              href={`/${locale}/hotels/${hotelSlug}/book?${bookingUrl.toString()}`}
              className="px-8 py-3 bg-[var(--color-charcoal)] text-[var(--color-pearl)] rounded-lg hover:bg-[var(--color-slate)] transition-all duration-200 font-medium text-lg"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
