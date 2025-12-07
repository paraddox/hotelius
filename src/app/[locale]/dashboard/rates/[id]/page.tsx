import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RatePlanForm } from '@/components/dashboard/RatePlanForm';
import { notFound } from 'next/navigation';

// Mock data - would be fetched from database
const mockRatePlans = {
  '1': {
    id: '1',
    name: 'Standard Rate',
    roomTypeId: 'standard',
    pricePerNight: 15000,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    priority: 1,
    minimumStay: 1,
    dayOfWeekRestrictions: null,
    status: 'active' as const,
  },
  '2': {
    id: '2',
    name: 'Weekend Special',
    roomTypeId: 'standard',
    pricePerNight: 12000,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    priority: 2,
    minimumStay: 2,
    dayOfWeekRestrictions: [5, 6],
    status: 'active' as const,
  },
};

interface EditRatePlanPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function EditRatePlanPage({ params }: EditRatePlanPageProps) {
  await requireAuth();
  const { id } = await params;
  const t = await getTranslations('dashboard.rates');

  // Get rate plan data
  const ratePlan = mockRatePlans[id as keyof typeof mockRatePlans];

  if (!ratePlan) {
    notFound();
  }

  // Convert date strings to Date objects for the form
  const ratePlanWithDates = {
    ...ratePlan,
    validFrom: new Date(ratePlan.validFrom),
    validTo: new Date(ratePlan.validTo),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/rates"
          className="inline-flex items-center gap-2 text-sm text-[#8B8B8B] hover:text-[#C4A484] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('actions.backToList')}
        </Link>
        <h1 className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C]">
          {t('edit.title')}
        </h1>
        <p className="mt-2 text-sm text-[#8B8B8B]">{t('edit.subtitle')}</p>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg border border-[#E8E0D5]">
        <div className="px-4 py-5 sm:p-6">
          <RatePlanForm mode="edit" defaultValues={ratePlanWithDates} />
        </div>
      </div>
    </div>
  );
}
