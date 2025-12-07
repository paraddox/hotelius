import { Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';

// Mock user data - replace with actual data fetching
async function getUserProfile() {
  // TODO: Replace with actual API call
  return {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    joinedDate: new Date('2024-01-01'),
    totalBookings: 12,
    upcomingBookings: 2,
  };
}

export default async function AccountPage() {
  const user = await getUserProfile();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">My Profile</h1>
            <p className="text-[var(--foreground-muted)]">
              Manage your personal information and preferences
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-charcoal)] text-[var(--color-pearl)] rounded-lg hover:opacity-90 transition-all">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-terracotta)]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--color-terracotta)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{user.totalBookings}</p>
              <p className="text-[var(--foreground-muted)] text-sm">Total Bookings</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-success)]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{user.upcomingBookings}</p>
              <p className="text-[var(--foreground-muted)] text-sm">Upcoming Trips</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-terracotta)]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--color-terracotta)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {new Date().getFullYear() - user.joinedDate.getFullYear()}
              </p>
              <p className="text-[var(--foreground-muted)] text-sm">Years with us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-serif font-semibold mb-6 text-[var(--foreground)]">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[var(--foreground-muted)] mb-1">Full Name</p>
            <p className="font-medium text-[var(--foreground)]">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-[var(--foreground-muted)] mb-1">Date of Birth</p>
            <p className="font-medium text-[var(--foreground)]">
              {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-1">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="font-medium text-[var(--foreground)]">{user.email}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] mb-1">
              <Phone className="w-4 h-4" />
              Phone Number
            </div>
            <p className="font-medium text-[var(--foreground)]">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-serif font-semibold mb-6 text-[var(--foreground)]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </div>
        </h2>

        <div className="space-y-1 text-[var(--foreground)]">
          <p className="font-medium">{user.address.street}</p>
          <p>
            {user.address.city}, {user.address.state} {user.address.zip}
          </p>
          <p>{user.address.country}</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-[var(--background-elevated)] rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-serif font-semibold mb-6 text-[var(--foreground)]">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[var(--foreground-muted)] mb-1">Member Since</p>
            <p className="font-medium text-[var(--foreground)]">
              {user.joinedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-[var(--foreground-muted)] mb-1">Account Status</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
