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
    <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-serif font-medium text-[var(--foreground)] mb-6">{t('title')}</h2>

        <form className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
                {t('fields.name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={mockHotelData.name}
                className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)]">
                {t('fields.description')}
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                defaultValue={mockHotelData.description}
                className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-[var(--foreground)]">
                {t('fields.timezone')}
              </label>
              <select
                name="timezone"
                id="timezone"
                defaultValue={mockHotelData.timezone}
                className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
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
              <label htmlFor="currency" className="block text-sm font-medium text-[var(--foreground)]">
                {t('fields.currency')}
              </label>
              <select
                name="currency"
                id="currency"
                defaultValue={mockHotelData.currency}
                className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-[var(--color-sand)] pt-6">
            <h3 className="text-base font-serif font-medium text-[var(--foreground)] mb-4">
              {t('sections.contact')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={mockHotelData.email}
                  className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  defaultValue={mockHotelData.phone}
                  className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-[var(--color-sand)] pt-6">
            <h3 className="text-base font-serif font-medium text-[var(--foreground)] mb-4">
              {t('sections.address')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.address')}
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  defaultValue={mockHotelData.address}
                  className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.city')}
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  defaultValue={mockHotelData.city}
                  className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.zipCode')}
                </label>
                <input
                  type="text"
                  name="zipCode"
                  id="zipCode"
                  defaultValue={mockHotelData.zipCode}
                  className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="country" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.country')}
                </label>
                <input
                  type="text"
                  name="country"
                  id="country"
                  defaultValue={mockHotelData.country}
                  className="mt-1 block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-[var(--color-sand)]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] shadow-sm hover:bg-[var(--color-slate)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-charcoal)] transition-all duration-200"
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
