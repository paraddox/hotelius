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
        <h2 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('signInTitle')}</h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('signInSubtitle')}</p>
      </div>

      <LoginForm />
    </div>
  )
}
