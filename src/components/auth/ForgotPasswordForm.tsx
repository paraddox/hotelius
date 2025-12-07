'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const { resetPassword } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const { error: resetError } = await resetPassword(data.email)

    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-[var(--background-elevated)] p-3">
            <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
          </div>
        </div>
        <h3 className="text-lg font-serif font-medium text-[var(--foreground)]">{t('resetEmailSent')}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">{t('resetEmailSentMessage')}</p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta)] transition-all duration-200"
          >
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-[var(--color-error)] bg-[var(--background-elevated)] border border-[var(--color-error)] rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="text-center space-y-2 mb-6">
        <p className="text-sm text-[var(--foreground-muted)]">{t('forgotPasswordDescription')}</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
          {t('email')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-[var(--foreground-muted)]" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="block w-full pl-10 pr-3 py-2 border border-[var(--color-sand)] rounded-lg focus:ring-2 focus:ring-[var(--color-terracotta)] focus:border-transparent transition-all duration-200"
            placeholder={t('emailPlaceholder')}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[var(--color-pearl)] bg-[var(--color-charcoal)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-terracotta)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? t('sendingResetLink') : t('sendResetLink')}
      </button>

      <div className="text-center text-sm">
        <Link
          href="/auth/login"
          className="font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta)] transition-all duration-200"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </form>
  )
}
