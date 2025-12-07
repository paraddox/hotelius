import { useTranslations } from 'next-intl'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Forgot Password - Hotelius',
  description: 'Reset your Hotelius password',
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-medium text-[var(--foreground)]">{t('title')}</h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
