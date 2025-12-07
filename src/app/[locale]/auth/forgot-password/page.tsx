import { useTranslations } from 'next-intl'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Forgot Password - Hotelius',
  description: 'Reset your Hotelius password',
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-[var(--foreground)]">{t('forgotPasswordTitle')}</h2>
      </div>

      <ForgotPasswordForm />
    </div>
  )
}
