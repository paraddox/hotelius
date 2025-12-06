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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="md:flex">
        {/* Room Image */}
        <div className="md:w-1/3 relative h-64 md:h-auto bg-gray-200">
          <Image
            src={room.image}
            alt={room.name}
            fill
            className="object-cover"
          />
          {room.available <= 3 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Only {room.available} left
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {room.name}
              </h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
            </div>
          </div>

          {/* Room Features */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
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
            <p className="text-sm font-medium text-gray-700 mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 6).map((amenity, index) => {
                const Icon = amenityIcons[amenity];
                return (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{amenity}</span>
                  </div>
                );
              })}
              {room.amenities.length > 6 && (
                <span className="text-sm text-blue-600">
                  +{room.amenities.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Pricing and CTA */}
          <div className="flex items-end justify-between pt-4 border-t">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${room.price}
                </span>
                <span className="text-gray-600">/ night</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                ${totalPrice} total for {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Excludes taxes & fees</p>
            </div>
            <Link
              href={`/${locale}/hotels/${hotelSlug}/book?${bookingUrl.toString()}`}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
