import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Save } from 'lucide-react';

// Mock hotel data
const mockHotelData = {
  name: 'Grand Hotel',
  description: 'A luxurious hotel in the heart of the city',
  timezone: 'America/New_York',
  currency: 'USD',
  email: 'info@grandhotel.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street',
  city: 'New York',
  country: 'United States',
  zipCode: '10001',
};

export default async function SettingsGeneralPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.settings.general');

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">{t('title')}</h2>

        <form className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('fields.name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={mockHotelData.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                {t('fields.description')}
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                defaultValue={mockHotelData.description}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                {t('fields.timezone')}
              </label>
              <select
                name="timezone"
                id="timezone"
                defaultValue={mockHotelData.timezone}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                {t('fields.currency')}
              </label>
              <select
                name="currency"
                id="currency"
                defaultValue={mockHotelData.currency}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              {t('sections.contact')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('fields.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={mockHotelData.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t('fields.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={mockHotelData.phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              {t('sections.address')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  {t('fields.address')}
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  defaultValue={mockHotelData.address}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  {t('fields.city')}
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  defaultValue={mockHotelData.city}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  {t('fields.zipCode')}
                </label>
                <input
                  type="text"
                  name="zipCode"
                  id="zipCode"
                  defaultValue={mockHotelData.zipCode}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  {t('fields.country')}
                </label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  defaultValue={mockHotelData.country}
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
