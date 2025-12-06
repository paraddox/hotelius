import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Save } from 'lucide-react';

// Mock data
const mockPoliciesData = {
  checkInTime: '15:00',
  checkOutTime: '11:00',
  cancellationPolicy: 'free',
  cancellationHours: 24,
  childrenPolicy: 'Children of all ages are welcome',
  petPolicy: 'Pets are not allowed',
  smokingPolicy: 'no-smoking',
};

export default async function SettingsPoliciesPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.settings.policies');

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">{t('title')}</h2>

        <form className="space-y-6">
          {/* Check-in/out Times */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">
              {t('sections.checkInOut')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700">
                  {t('fields.checkInTime')}
                </label>
                <input
                  type="time"
                  name="checkInTime"
                  id="checkInTime"
                  defaultValue={mockPoliciesData.checkInTime}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700">
                  {t('fields.checkOutTime')}
                </label>
                <input
                  type="time"
                  name="checkOutTime"
                  id="checkOutTime"
                  defaultValue={mockPoliciesData.checkOutTime}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              {t('sections.cancellation')}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700">
                  {t('fields.cancellationPolicy')}
                </label>
                <select
                  name="cancellationPolicy"
                  id="cancellationPolicy"
                  defaultValue={mockPoliciesData.cancellationPolicy}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="free">{t('options.freeCancellation')}</option>
                  <option value="moderate">{t('options.moderatePolicy')}</option>
                  <option value="strict">{t('options.strictPolicy')}</option>
                  <option value="non-refundable">{t('options.nonRefundable')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="cancellationHours" className="block text-sm font-medium text-gray-700">
                  {t('fields.cancellationHours')}
                </label>
                <input
                  type="number"
                  name="cancellationHours"
                  id="cancellationHours"
                  defaultValue={mockPoliciesData.cancellationHours}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
                <p className="mt-1 text-sm text-gray-500">{t('fields.cancellationHoursHint')}</p>
              </div>
            </div>
          </div>

          {/* Other Policies */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              {t('sections.otherPolicies')}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="smokingPolicy" className="block text-sm font-medium text-gray-700">
                  {t('fields.smokingPolicy')}
                </label>
                <select
                  name="smokingPolicy"
                  id="smokingPolicy"
                  defaultValue={mockPoliciesData.smokingPolicy}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="no-smoking">{t('options.noSmoking')}</option>
                  <option value="designated-areas">{t('options.designatedAreas')}</option>
                  <option value="allowed">{t('options.smokingAllowed')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="petPolicy" className="block text-sm font-medium text-gray-700">
                  {t('fields.petPolicy')}
                </label>
                <textarea
                  name="petPolicy"
                  id="petPolicy"
                  rows={2}
                  defaultValue={mockPoliciesData.petPolicy}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="childrenPolicy" className="block text-sm font-medium text-gray-700">
                  {t('fields.childrenPolicy')}
                </label>
                <textarea
                  name="childrenPolicy"
                  id="childrenPolicy"
                  rows={2}
                  defaultValue={mockPoliciesData.childrenPolicy}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Save className="h-4 w-4" />
              {t('actions.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
