import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Plus, Edit, Trash2, Filter, Search } from 'lucide-react';
import Link from 'next/link';

// Mock rooms data
const mockRooms = [
  {
    id: '1',
    roomNumber: '101',
    floor: 1,
    roomType: 'Standard Room',
    status: 'available',
    currentBooking: null,
  },
  {
    id: '2',
    roomNumber: '102',
    floor: 1,
    roomType: 'Standard Room',
    status: 'occupied',
    currentBooking: {
      guestName: 'John Doe',
      checkOut: '2025-12-10',
    },
  },
  {
    id: '3',
    roomNumber: '103',
    floor: 1,
    roomType: 'Standard Room',
    status: 'maintenance',
    currentBooking: null,
  },
  {
    id: '4',
    roomNumber: '201',
    floor: 2,
    roomType: 'Deluxe Room',
    status: 'available',
    currentBooking: null,
  },
  {
    id: '5',
    roomNumber: '202',
    floor: 2,
    roomType: 'Deluxe Room',
    status: 'occupied',
    currentBooking: {
      guestName: 'Jane Smith',
      checkOut: '2025-12-13',
    },
  },
  {
    id: '6',
    roomNumber: '301',
    floor: 3,
    roomType: 'Suite',
    status: 'available',
    currentBooking: null,
  },
  {
    id: '7',
    roomNumber: '302',
    floor: 3,
    roomType: 'Suite',
    status: 'cleaning',
    currentBooking: null,
  },
];

const statusColors = {
  available: 'bg-[rgba(74,124,89,0.1)] text-[var(--color-success)]',
  occupied: 'bg-[rgba(135,168,120,0.1)] text-[var(--color-sage)]',
  maintenance: 'bg-[rgba(196,92,92,0.1)] text-[var(--color-error)]',
  cleaning: 'bg-[rgba(196,164,132,0.15)] text-[var(--color-terracotta)]',
  inactive: 'bg-[var(--color-cream)] text-[var(--foreground-muted)]',
};

const statusIcons = {
  available: '✓',
  occupied: '●',
  maintenance: '⚠',
  cleaning: '◐',
  inactive: '○',
};

export default async function RoomsPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.rooms');

  // Group rooms by floor
  const roomsByFloor = mockRooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, typeof mockRooms>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('title')}</h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/rooms/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2.5 text-sm font-medium text-[var(--color-pearl)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          {t('actions.addNew')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-[var(--shadow-soft)] p-4 border-l-4 border-[var(--color-success)]">
          <p className="text-sm text-[var(--foreground-muted)]">{t('stats.available')}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {mockRooms.filter(r => r.status === 'available').length}
          </p>
        </div>
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-[var(--shadow-soft)] p-4 border-l-4 border-[var(--color-sage)]">
          <p className="text-sm text-[var(--foreground-muted)]">{t('stats.occupied')}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {mockRooms.filter(r => r.status === 'occupied').length}
          </p>
        </div>
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-[var(--shadow-soft)] p-4 border-l-4 border-[var(--color-terracotta)]">
          <p className="text-sm text-[var(--foreground-muted)]">{t('stats.cleaning')}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {mockRooms.filter(r => r.status === 'cleaning').length}
          </p>
        </div>
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-[var(--shadow-soft)] p-4 border-l-4 border-[var(--color-error)]">
          <p className="text-sm text-[var(--foreground-muted)]">{t('stats.maintenance')}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {mockRooms.filter(r => r.status === 'maintenance').length}
          </p>
        </div>
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-[var(--shadow-soft)] p-4 border-l-4 border-[var(--foreground-muted)]">
          <p className="text-sm text-[var(--foreground-muted)]">{t('stats.total')}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{mockRooms.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-[var(--foreground-muted)]" />
                </div>
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  className="block w-full rounded-lg border border-[var(--color-sand)] bg-[var(--background)] pl-10 pr-3 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <select className="block w-full rounded-lg border border-[var(--color-sand)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150 sm:text-sm">
                <option value="">{t('filters.allRoomTypes')}</option>
                <option value="standard">Standard Room</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="suite">Suite</option>
              </select>
            </div>

            <div>
              <select className="block w-full rounded-lg border border-[var(--color-sand)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150 sm:text-sm">
                <option value="">{t('filters.allStatuses')}</option>
                <option value="available">{t('statuses.available')}</option>
                <option value="occupied">{t('statuses.occupied')}</option>
                <option value="cleaning">{t('statuses.cleaning')}</option>
                <option value="maintenance">{t('statuses.maintenance')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms by Floor */}
      <div className="space-y-6">
        {Object.entries(roomsByFloor)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([floor, rooms]) => (
            <div key={floor} className="bg-[var(--background-elevated)] shadow-[var(--shadow-soft)] rounded-xl border border-[var(--color-sand)]">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="font-serif text-lg font-medium text-[var(--foreground)] mb-4">
                  {t('floor')} {floor}
                </h2>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-[var(--color-sand)]">
                    <thead className="bg-[var(--color-cream)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          {t('table.roomNumber')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          {t('table.roomType')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          {t('table.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          {t('table.currentGuest')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          {t('table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--background-elevated)] divide-y divide-[var(--color-sand)]">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-[var(--color-cream)] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-[var(--foreground)]">{room.roomNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                            {room.roomType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[room.status as keyof typeof statusColors]}`}>
                              <span>{statusIcons[room.status as keyof typeof statusIcons]}</span>
                              {t(`statuses.${room.status}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                            {room.currentBooking ? (
                              <div>
                                <div className="font-medium text-[var(--foreground)]">{room.currentBooking.guestName}</div>
                                <div className="text-xs text-[var(--foreground-muted)]">Until {room.currentBooking.checkOut}</div>
                              </div>
                            ) : (
                              <span className="text-[var(--foreground-muted)] opacity-50">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/dashboard/rooms/${room.id}`}
                                className="text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                className="text-[var(--color-error)] hover:opacity-75 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
