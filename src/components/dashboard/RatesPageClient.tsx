'use client';

import { useState } from 'react';
import { Plus, Search, Calendar, DollarSign, Layers } from 'lucide-react';
import Link from 'next/link';
import { RatePlanCard } from '@/components/dashboard/RatePlanCard';
import { BulkRateEditor } from '@/components/dashboard/BulkRateEditor';

interface RatePlan {
  id: string;
  name: string;
  roomType: string;
  roomTypeId: string;
  pricePerNight: number;
  validFrom: string;
  validTo: string;
  priority: number;
  minimumStay: number;
  dayOfWeekRestrictions: number[] | null;
  status: 'active' | 'inactive';
  isDefault?: boolean;
}

interface RatesPageClientProps {
  ratePlans: RatePlan[];
  translations: {
    title: string;
    subtitle: string;
    addNew: string;
    bulkUpdate: string;
    searchPlaceholder: string;
    statsTotal: string;
    statsActive: string;
    statsAvgPrice: string;
    statsRoomTypes: string;
  };
}

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

export function RatesPageClient({ ratePlans, translations }: RatesPageClientProps) {
  const [isBulkEditorOpen, setIsBulkEditorOpen] = useState(false);

  // Group rate plans by room type
  const ratePlansByRoomType = ratePlans.reduce((acc, plan) => {
    if (!acc[plan.roomType]) {
      acc[plan.roomType] = [];
    }
    acc[plan.roomType].push(plan);
    return acc;
  }, {} as Record<string, typeof ratePlans>);

  // Calculate stats
  const activeRatePlans = ratePlans.filter(r => r.status === 'active');
  const avgPrice = activeRatePlans.length > 0
    ? activeRatePlans.reduce((sum, r) => sum + r.pricePerNight, 0) / activeRatePlans.length
    : 0;

  const handleBulkUpdateSuccess = () => {
    // In a real app, this would refresh the data
    // For now, we'll just close the modal
    // You might want to use router.refresh() or revalidate the data
    console.log('Bulk update successful - page would refresh here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C]">
            {translations.title}
          </h1>
          <p className="mt-2 text-sm text-[#8B8B8B]">{translations.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBulkEditorOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-white border-2 border-[#C4A484] px-4 py-2 text-sm font-semibold text-[#C4A484] hover:bg-[#C4A484] hover:text-white transition-colors"
          >
            <Layers className="h-4 w-4" />
            {translations.bulkUpdate}
          </button>
          <Link
            href="/dashboard/rates/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#C4A484] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#A67B5B] transition-colors"
          >
            <Plus className="h-4 w-4" />
            {translations.addNew}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8B8B8B]">{translations.statsTotal}</p>
              <p className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C] mt-1">
                {ratePlans.length}
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
              <p className="text-sm text-[#8B8B8B]">{translations.statsActive}</p>
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
              <p className="text-sm text-[#8B8B8B]">{translations.statsAvgPrice}</p>
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
              <p className="text-sm text-[#8B8B8B]">{translations.statsRoomTypes}</p>
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
                  placeholder={translations.searchPlaceholder}
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
        {Object.entries(ratePlansByRoomType).map(([roomType, plans]) => (
          <div key={roomType} className="bg-white shadow-sm rounded-lg border border-[#E8E0D5]">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-['Cormorant_Garamond',Georgia,serif] font-medium text-[#2C2C2C] mb-4">
                {roomType}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plans.map((ratePlan) => (
                  <RatePlanCard key={ratePlan.id} ratePlan={ratePlan} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Rate Editor Modal */}
      {isBulkEditorOpen && (
        <BulkRateEditor
          ratePlans={ratePlans}
          onClose={() => setIsBulkEditorOpen(false)}
          onSuccess={handleBulkUpdateSuccess}
        />
      )}
    </div>
  );
}
