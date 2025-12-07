import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export const metadata = {
  title: 'Unauthorized - Hotelius',
  description: 'You do not have permission to access this page',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-[rgba(196,92,92,0.1)] p-4">
            <ShieldAlert className="w-16 h-16 text-[var(--color-error)]" />
          </div>
        </div>
        <h1 className="mt-6 text-center font-serif text-3xl font-medium text-[var(--foreground)]">
          Access Denied
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--foreground-muted)]">
          You do not have permission to access this page.
        </p>
        <div className="mt-8 text-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-[var(--color-pearl)] bg-[var(--color-charcoal)] hover:bg-[var(--color-slate)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all duration-200"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2.5 border border-[var(--color-sand)] text-sm font-medium rounded-lg text-[var(--foreground)] bg-[var(--background-elevated)] hover:bg-[var(--color-cream)] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
