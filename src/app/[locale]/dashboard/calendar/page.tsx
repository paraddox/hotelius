import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { TapeChart } from '@/components/dashboard/calendar/TapeChart';
import { Calendar } from 'lucide-react';

export default async function CalendarPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.calendar');

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#C4A484]/10 rounded-lg">
            <Calendar className="h-6 w-6 text-[#C4A484]" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-[#2C2C2C]">
            {t('title')}
          </h1>
        </div>
        <p className="text-[#8B8B8B] ml-14">
          {t('subtitle')}
        </p>
      </div>

      {/* Calendar Tape Chart */}
      <div className="h-[calc(100vh-200px)]">
        <TapeChart />
      </div>
    </div>
  );
}
