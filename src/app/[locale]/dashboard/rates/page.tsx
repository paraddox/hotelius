import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { RatesPageClient } from '@/components/dashboard/RatesPageClient';

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
    status: 'active' as const,
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
    status: 'active' as const,
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
    status: 'active' as const,
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
    status: 'active' as const,
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
    status: 'active' as const,
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
    status: 'inactive' as const,
    isDefault: false,
  },
];

export default async function RatePlansPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.rates');

  // Prepare translations object
  const translations = {
    title: t('title'),
    subtitle: t('subtitle'),
    addNew: t('actions.addNew'),
    bulkUpdate: t('actions.bulkUpdate'),
    searchPlaceholder: t('filters.searchPlaceholder'),
    statsTotal: t('stats.total'),
    statsActive: t('stats.active'),
    statsAvgPrice: t('stats.avgPrice'),
    statsRoomTypes: t('stats.roomTypes'),
  };

  return <RatesPageClient ratePlans={mockRatePlans} translations={translations} />;
}
