import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Plus, Search, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { RatePlanCard } from '@/components/dashboard/RatePlanCard';

// Mock rate plans data
const mockRatePlans = [
  {
    id: '1',
    name: 'Standard Rate',
    roomType: 'Standard Room',
    roomTypeId: 'standard',
    pricePerNight: 15000, // in cents ($150.00)
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    priority: 1,
    minimumStay: 1,
    dayOfWeekRestrictions: null,
    status: 'active',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Weekend Special',
    roomType: 'Standard Room',
    roomTypeId: 'standard',
    pricePerNight: 12000, // in cents ($120.00)
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    priority: 2,
    minimumStay: 2,
    dayOfWeekRestrictions: [5, 6], // Friday, Saturday
    status: 'active',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Deluxe Summer Rate',
    roomType: 'Deluxe Room',
    roomTypeId: 'deluxe',
    pricePerNight: 25000, // in cents ($250.00)
    validFrom: '2025-06-01',
    validTo: '2025-08-31',
    priority: 1,
    minimumStay: 1,
    dayOfWeekRestrictions: null,
    status: 'active',
    isDefault: false,
  },
  {
    id: '4',
    name: 'Suite Standard Rate',
    roomType: 'Suite',
    roomTypeId: 'suite',
    pricePerNight: 35000, // in cents ($350.00)
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    priority: 1,
    minimumStay: 1,
    dayOfWeekRestrictions: null,
    status: 'active',
    isDefault: true,
  },
  {
    id: '5',
    name: 'Holiday Premium',
    roomType: 'Deluxe Room',
    roomTypeId: 'deluxe',
    pricePerNight: 30000, // in cents ($300.00)
    validFrom: '2025-12-20',
    validTo: '2026-01-05',
    priority: 10,
    minimumStay: 3,
    dayOfWeekRestrictions: null,
    status: 'active',
    isDefault: false,
  },
  {
    id: '6',
    name: 'Early Bird Spring',
    roomType: 'Standard Room',
    roomTypeId: 'standard',
    pricePerNight: 13500, // in cents ($135.00)
    validFrom: '2025-03-01',
    validTo: '2025-05-31',
    priority: 2,
    minimumStay: 2,
    dayOfWeekRestrictions: null,
    status: 'inactive',
    isDefault: false,
  },
];

const roomTypes = [
  { value: '', label: 'All Room Types' },
  { value: 'standard', label: 'Standard Room' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'suite', label: 'Suite' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default async function RatePlansPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.rates');

  // Group rate plans by room type
  const ratePlansByRoomType = mockRatePlans.reduce((acc, plan) => {
    if (!acc[plan.roomType]) {
      acc[plan.roomType] = [];
    }
    acc[plan.roomType].push(plan);
    return acc;
  }, {} as Record<string, typeof mockRatePlans>);

  // Calculate stats
  const activeRatePlans = mockRatePlans.filter(r => r.status === 'active');
  const avgPrice = activeRatePlans.length > 0
    ? activeRatePlans.reduce((sum, r) => sum + r.pricePerNight, 0) / activeRatePlans.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C]">
            {t('title')}
          </h1>
          <p className="mt-2 text-sm text-[#8B8B8B]">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/rates/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#C4A484] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#A67B5B] transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('actions.addNew')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B8B8B]">{t('stats.total')}</p>
              <p className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C] mt-1">
                {mockRatePlans.length}
              </p>
            </div>
            <div className="p-3 bg-[#F0EBE3] rounded-lg">
              <Calendar className="h-5 w-5 text-[#C4A484]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B8B8B]">{t('stats.active')}</p>
              <p className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C] mt-1">
                {activeRatePlans.length}
              </p>
            </div>
            <div className="p-3 bg-[#E8F5E9] rounded-lg">
              <Calendar className="h-5 w-5 text-[#4A7C59]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B8B8B]">{t('stats.avgPrice')}</p>
              <p className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C] mt-1">
                ${(avgPrice / 100).toFixed(0)}
              </p>
            </div>
            <div className="p-3 bg-[#F0EBE3] rounded-lg">
              <DollarSign className="h-5 w-5 text-[#C4A484]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B8B8B]">{t('stats.roomTypes')}</p>
              <p className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C] mt-1">
                {Object.keys(ratePlansByRoomType).length}
              </p>
            </div>
            <div className="p-3 bg-[#F0EBE3] rounded-lg">
              <Calendar className="h-5 w-5 text-[#C4A484]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg border border-[#E8E0D5]">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-[#8B8B8B]" />
                </div>
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  className="block w-full rounded-md border-[#E8E0D5] pl-10 focus:border-[#C4A484] focus:ring-[#C4A484] sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>

            <div>
              <select className="block w-full rounded-md border-[#E8E0D5] focus:border-[#C4A484] focus:ring-[#C4A484] sm:text-sm px-3 py-2 border">
                {roomTypes.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select className="block w-full rounded-md border-[#E8E0D5] focus:border-[#C4A484] focus:ring-[#C4A484] sm:text-sm px-3 py-2 border">
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rate Plans by Room Type */}
      <div className="space-y-6">
        {Object.entries(ratePlansByRoomType).map(([roomType, ratePlans]) => (
          <div key={roomType} className="bg-white shadow-sm rounded-lg border border-[#E8E0D5]">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C] mb-4">
                {roomType}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ratePlans.map((ratePlan) => (
                  <RatePlanCard key={ratePlan.id} ratePlan={ratePlan} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
