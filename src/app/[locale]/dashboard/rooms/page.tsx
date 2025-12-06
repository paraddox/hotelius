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
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-red-100 text-red-800',
  cleaning: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
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
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/rooms/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          {t('actions.addNew')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">{t('stats.available')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {mockRooms.filter(r => r.status === 'available').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">{t('stats.occupied')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {mockRooms.filter(r => r.status === 'occupied').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">{t('stats.cleaning')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {mockRooms.filter(r => r.status === 'cleaning').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">{t('stats.maintenance')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {mockRooms.filter(r => r.status === 'maintenance').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <p className="text-sm text-gray-600">{t('stats.total')}</p>
          <p className="text-2xl font-bold text-gray-900">{mockRooms.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            <div>
              <select className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
                <option value="">{t('filters.allRoomTypes')}</option>
                <option value="standard">Standard Room</option>
                <option value="deluxe">Deluxe Room</option>
                <option value="suite">Suite</option>
              </select>
            </div>

            <div>
              <select className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border">
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
            <div key={floor} className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {t('floor')} {floor}
                </h2>
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.roomNumber')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.roomType')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.currentGuest')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{room.roomNumber}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.roomType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[room.status as keyof typeof statusColors]}`}>
                              <span>{statusIcons[room.status as keyof typeof statusIcons]}</span>
                              {t(`statuses.${room.status}`)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {room.currentBooking ? (
                              <div>
                                <div className="font-medium text-gray-900">{room.currentBooking.guestName}</div>
                                <div className="text-xs text-gray-500">Until {room.currentBooking.checkOut}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/dashboard/rooms/${room.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                className="text-red-600 hover:text-red-900"
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
