import { useTranslations } from 'next-intl'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata = {
  title: 'Sign Up - Hotelius',
  description: 'Create your Hotelius account',
}

export default function SignUpPage() {
  const t = useTranslations('auth')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('signUpTitle')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('signUpSubtitle')}</p>
      </div>

      <SignUpForm />
    </div>
  )
}
