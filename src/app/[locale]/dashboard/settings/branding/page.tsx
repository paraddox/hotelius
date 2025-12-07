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
    <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-serif font-medium text-[var(--foreground)] mb-6">{t('title')}</h2>

        <form className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              {t('fields.logo')}
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-[var(--color-sand)] flex items-center justify-center bg-[var(--background)]">
                {mockBrandingData.logo ? (
                  <img src={mockBrandingData.logo} alt="Logo" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <Image className="h-8 w-8 text-[var(--foreground-muted)]" />
                )}
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--color-sand)] hover:bg-[var(--color-sand)]/30 transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
                {t('actions.uploadLogo')}
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">{t('fields.logoHint')}</p>
          </div>

          {/* Favicon Upload */}
          <div className="border-t border-[var(--color-sand)] pt-6">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              {t('fields.favicon')}
            </label>
            <div className="mt-1 flex items-center gap-4">
              <div className="h-16 w-16 rounded border-2 border-dashed border-[var(--color-sand)] flex items-center justify-center bg-[var(--background)]">
                <Image className="h-6 w-6 text-[var(--foreground-muted)]" />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--background-elevated)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm ring-1 ring-inset ring-[var(--color-sand)] hover:bg-[var(--color-sand)]/30 transition-all duration-200"
              >
                <Upload className="h-4 w-4" />
                {t('actions.uploadFavicon')}
              </button>
            </div>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">{t('fields.faviconHint')}</p>
          </div>

          {/* Color Scheme */}
          <div className="border-t border-[var(--color-sand)] pt-6">
            <h3 className="text-base font-serif font-medium text-[var(--foreground)] mb-4">
              {t('sections.colors')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.primaryColor')}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    defaultValue={mockBrandingData.primaryColor}
                    className="h-10 w-20 rounded-lg border border-[var(--color-sand)] cursor-pointer transition-all duration-200"
                  />
                  <input
                    type="text"
                    defaultValue={mockBrandingData.primaryColor}
                    className="block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-[var(--foreground)]">
                  {t('fields.secondaryColor')}
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    name="secondaryColor"
                    id="secondaryColor"
                    defaultValue={mockBrandingData.secondaryColor}
                    className="h-10 w-20 rounded-lg border border-[var(--color-sand)] cursor-pointer transition-all duration-200"
                  />
                  <input
                    type="text"
                    defaultValue={mockBrandingData.secondaryColor}
                    className="block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">{t('fields.colorsHint')}</p>
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
