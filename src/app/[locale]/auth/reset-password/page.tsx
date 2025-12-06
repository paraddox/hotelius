import { useTranslations } from 'next-intl'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Reset Password - Hotelius',
  description: 'Create a new password for your Hotelius account',
}

export default function ResetPasswordPage() {
  const t = useTranslations('auth')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('resetPasswordTitle')}</h2>
      </div>

      <ResetPasswordForm />
    </div>
  )
}
