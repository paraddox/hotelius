'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { signUp } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const { error: signUpError } = await signUp(data.email, data.password, {
      full_name: data.fullName,
      role: 'guest', // Default role for new sign-ups
    })

    if (signUpError) {
      setError(signUpError.message)
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
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900">{t('signUpSuccess')}</h3>
        <p className="text-sm text-gray-600">{t('signUpSuccessMessage')}</p>
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

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          {t('fullName')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            {...register('fullName')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('fullNamePlaceholder')}
          />
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
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

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          {t('password')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('passwordPlaceholder')}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          {t('confirmPassword')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('confirmPasswordPlaceholder')}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? t('signingUp') : t('signUp')}
      </button>

      <div className="text-center text-sm">
        <span className="text-gray-600">{t('alreadyHaveAccount')} </span>
        <Link
          href="/auth/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          {t('signIn')}
        </Link>
      </div>
    </form>
  )
}
