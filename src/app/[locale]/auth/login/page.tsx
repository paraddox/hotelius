import { useTranslations } from 'next-intl'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Login - Hotelius',
  description: 'Sign in to your Hotelius account',
}

export default function LoginPage() {
  const t = useTranslations('auth')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('signInTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('signInSubtitle')}</p>
      </div>

      <LoginForm />
    </div>
  )
}
