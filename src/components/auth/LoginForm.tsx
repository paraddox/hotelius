'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    const { error: signInError } = await signIn(data.email, data.password)

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    // Redirect to the intended page or dashboard
    const redirectTo = searchParams.get('redirectTo') || '/dashboard'
    router.push(redirectTo)
    router.refresh()
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
        <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
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
            className="block w-full pl-10 pr-3 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
            placeholder={t('emailPlaceholder')}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
          {t('password')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-[var(--foreground-muted)]" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="block w-full pl-10 pr-3 py-2.5 border border-[var(--color-sand)] rounded-lg bg-[var(--background-elevated)] text-[var(--foreground)] focus:ring-2 focus:ring-[rgba(196,164,132,0.15)] focus:border-[var(--color-terracotta)] transition-all duration-150"
            placeholder={t('passwordPlaceholder')}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] transition-colors"
          >
            {t('forgotPassword')}
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-[var(--color-pearl)] bg-[var(--color-charcoal)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? t('signingIn') : t('signIn')}
      </button>

      <div className="text-center text-sm">
        <span className="text-[var(--foreground-muted)]">{t('dontHaveAccount')} </span>
        <Link
          href="/auth/signup"
          className="font-medium text-[var(--color-terracotta)] hover:text-[var(--color-terracotta-dark)] transition-colors"
        >
          {t('signUp')}
        </Link>
      </div>
    </form>
  )
}
