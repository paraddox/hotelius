import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-[var(--color-terracotta)]/5 blur-3xl" />
        <div className="absolute left-0 bottom-1/4 h-64 w-64 rounded-full bg-[var(--color-sage)]/5 blur-3xl" />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-medium italic text-[var(--color-terracotta)]">Hotelius</h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">Boutique Hotel Management</p>
        </div>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--background-elevated)] py-8 px-4 shadow-[var(--shadow-medium)] border border-[var(--color-sand)] sm:rounded-xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  )
}
