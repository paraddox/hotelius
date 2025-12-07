'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from '@/lib/i18n/navigation'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const t = useTranslations('auth.resetPassword')
  const tCommon = useTranslations('common.labels')
  const router = useRouter()
  const { updatePassword } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await updatePassword(data.password)

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-[rgba(74,124,89,0.1)] p-3">
            <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
          </div>
        </div>
        <h3 className="text-lg font-serif font-medium text-[var(--foreground)]">{t('successTitle')}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">{t('successMessage')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-[var(--color-error)] bg-[rgba(196,92,92,0.1)] border border-[var(--color-error)] rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
          {t('newPassword')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-[var(--foreground-muted)]" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className="block w-full pl-10 pr-3 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
            placeholder={t('newPasswordPlaceholder')}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
          {t('confirmPassword')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-[var(--foreground-muted)]" />
          </div>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="block w-full pl-10 pr-3 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
            placeholder={t('confirmPasswordPlaceholder')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[var(--color-charcoal)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? t('resetting') : t('submitButton')}
      </button>
    </form>
  )
}
