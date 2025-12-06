import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RatePlanForm } from '@/components/dashboard/RatePlanForm';

export default async function NewRatePlanPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.rates');

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
          {t('new.title')}
        </h1>
        <p className="mt-2 text-sm text-[#8B8B8B]">{t('new.subtitle')}</p>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg border border-[#E8E0D5]">
        <div className="px-4 py-5 sm:p-6">
          <RatePlanForm mode="create" />
        </div>
      </div>
    </div>
  );
}
