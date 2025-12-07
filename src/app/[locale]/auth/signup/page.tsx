import { useTranslations } from 'next-intl'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata = {
  title: 'Sign Up - Hotelius',
  description: 'Create your Hotelius account',
}

export default function SignUpPage() {
  const t = useTranslations('auth.signup')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-medium text-[var(--foreground)]">{t('title')}</h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">{t('subtitle')}</p>
      </div>

      <SignUpForm />
    </div>
  )
}
