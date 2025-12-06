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
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900">{t('resetEmailSent')}</h3>
        <p className="text-sm text-gray-600">{t('resetEmailSentMessage')}</p>
        <div className="pt-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
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
        <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="text-center space-y-2 mb-6">
        <p className="text-sm text-gray-600">{t('forgotPasswordDescription')}</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('email')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('emailPlaceholder')}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? t('sendingResetLink') : t('sendResetLink')}
      </button>

      <div className="text-center text-sm">
        <Link
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          {t('backToLogin')}
        </Link>
      </div>
    </form>
  )
}
