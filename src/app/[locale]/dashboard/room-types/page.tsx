import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Plus, Edit, Trash2, Users, DollarSign, Image } from 'lucide-react';
import Link from 'next/link';

// Mock room types data
const mockRoomTypes = [
  {
    id: '1',
    name: 'Standard Room',
    description: 'Comfortable room with essential amenities',
    basePrice: 150,
    occupancyAdults: 2,
    occupancyChildren: 1,
    totalRooms: 10,
    availableRooms: 6,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
    images: 2,
  },
  {
    id: '2',
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities and city view',
    basePrice: 220,
    occupancyAdults: 2,
    occupancyChildren: 2,
    totalRooms: 8,
    availableRooms: 4,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Coffee Maker'],
    images: 4,
  },
  {
    id: '3',
    name: 'Suite',
    description: 'Luxurious suite with separate living area',
    basePrice: 350,
    occupancyAdults: 4,
    occupancyChildren: 2,
    totalRooms: 4,
    availableRooms: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Coffee Maker', 'Kitchen', 'Jacuzzi'],
    images: 6,
  },
];

export default async function RoomTypesPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.roomTypes');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('title')}</h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/room-types/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2.5 text-sm font-medium text-[var(--color-pearl)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          {t('actions.addNew')}
        </Link>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {mockRoomTypes.map((roomType) => (
          <div key={roomType.id} className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)] overflow-hidden hover:shadow-[var(--shadow-medium)] hover:-translate-y-0.5 transition-all duration-200">
            {/* Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-[var(--color-cream)] to-[rgba(196,164,132,0.2)] flex items-center justify-center">
              <div className="text-center">
                <Image className="h-12 w-12 text-[var(--color-terracotta)] opacity-50 mx-auto mb-2" />
                <p className="text-sm text-[var(--color-terracotta)]">{roomType.images} {t('images')}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[var(--foreground)]">{roomType.name}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">{roomType.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-[var(--color-sand)]">
                <div>
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-1">
                    <DollarSign className="h-4 w-4" />
                    {t('fields.basePrice')}
                  </div>
                  <p className="text-xl font-bold text-[var(--color-terracotta)]">${roomType.basePrice}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{t('perNight')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-1">
                    <Users className="h-4 w-4" />
                    {t('fields.occupancy')}
                  </div>
                  <p className="text-xl font-bold text-[var(--foreground)]">
                    {roomType.occupancyAdults + roomType.occupancyChildren}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {roomType.occupancyAdults} {t('adults')}, {roomType.occupancyChildren} {t('children')}
                  </p>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--foreground-muted)]">{t('fields.availability')}</span>
                  <span className="font-medium text-[var(--foreground)]">
                    {roomType.availableRooms}/{roomType.totalRooms} {t('available')}
                  </span>
                </div>
                <div className="w-full bg-[var(--color-cream)] rounded-full h-2">
                  <div
                    className="bg-[var(--color-terracotta)] h-2 rounded-full"
                    style={{ width: `${(roomType.availableRooms / roomType.totalRooms) * 100}%` }}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">{t('fields.amenities')}</p>
                <div className="flex flex-wrap gap-1">
                  {roomType.amenities.slice(0, 3).map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-[var(--color-cream)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]"
                    >
                      {amenity}
                    </span>
                  ))}
                  {roomType.amenities.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-[var(--color-cream)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]">
                      +{roomType.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/room-types/${roomType.id}`}
                  className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--foreground)] border border-[var(--color-sand)] hover:bg-[var(--color-cream)] transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  {t('actions.edit')}
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-3 py-2.5 text-sm font-medium text-[var(--color-error)] border border-[var(--color-error)] hover:bg-[rgba(196,92,92,0.1)] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (show when no room types) */}
      {mockRoomTypes.length === 0 && (
        <div className="text-center py-12 bg-[var(--background-elevated)] rounded-xl shadow-[var(--shadow-soft)] border border-[var(--color-sand)]">
          <Image className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
          <h3 className="mt-2 font-serif text-sm font-medium text-[var(--foreground)]">{t('empty.title')}</h3>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{t('empty.description')}</p>
          <div className="mt-6">
            <Link
              href="/dashboard/room-types/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2.5 text-sm font-medium text-[var(--color-pearl)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              {t('actions.addNew')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
