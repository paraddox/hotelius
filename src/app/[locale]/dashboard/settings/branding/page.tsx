import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { Save, Upload, Image } from 'lucide-react';

// Mock data
const mockBrandingData = {
  logo: null,
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
};

export default async function SettingsBrandingPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.settings.branding');

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">{t('title')}</h2>

        <form className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fields.logo')}
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                {mockBrandingData.logo ? (
                  <img src={mockBrandingData.logo} alt="Logo" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                {t('actions.uploadLogo')}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('fields.logoHint')}</p>
          </div>

          {/* Favicon Upload */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fields.favicon')}
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-16 w-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                {t('actions.uploadFavicon')}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">{t('fields.faviconHint')}</p>
          </div>

          {/* Color Scheme */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">
              {t('sections.colors')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  {t('fields.primaryColor')}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    defaultValue={mockBrandingData.primaryColor}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={mockBrandingData.primaryColor}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                  {t('fields.secondaryColor')}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    name="secondaryColor"
                    id="secondaryColor"
                    defaultValue={mockBrandingData.secondaryColor}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={mockBrandingData.secondaryColor}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">{t('fields.colorsHint')}</p>
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
