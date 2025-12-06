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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.totalBookings}</p>
              <p className="text-gray-600 text-sm">Total Bookings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{user.upcomingBookings}</p>
              <p className="text-gray-600 text-sm">Upcoming Trips</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().getFullYear() - user.joinedDate.getFullYear()}
              </p>
              <p className="text-gray-600 text-sm">Years with us</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Full Name</p>
            <p className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
            <p className="font-medium text-gray-900">
              {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Phone className="w-4 h-4" />
              Phone Number
            </div>
            <p className="font-medium text-gray-900">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </div>
        </h2>

        <div className="space-y-1 text-gray-900">
          <p className="font-medium">{user.address.street}</p>
          <p>
            {user.address.city}, {user.address.state} {user.address.zip}
          </p>
          <p>{user.address.country}</p>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="font-medium text-gray-900">
              {user.joinedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Account Status</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
