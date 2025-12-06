import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export const metadata = {
  title: 'Unauthorized - Hotelius',
  description: 'You do not have permission to access this page',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Access Denied
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          You do not have permission to access this page.
        </p>
        <div className="mt-8 text-center space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
