import Link from 'next/link';
import { User, Calendar, Settings, LogOut } from 'lucide-react';

export default function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // TODO: Add authentication check here
  // In production, redirect to login if not authenticated

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
                <p className="text-gray-600 text-sm">john.doe@example.com</p>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/en/account"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/en/account/bookings"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Calendar className="w-5 h-5" />
                  <span>My Bookings</span>
                </Link>
                <Link
                  href="/en/account/settings"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
