import { requireAuth } from '@/lib/auth/requireAuth';
import { getTranslations } from 'next-intl/server';
import { UserPlus, Mail, MoreVertical, Trash2 } from 'lucide-react';

// Mock data
const mockTeamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@grandhotel.com',
    role: 'hotel_owner',
    status: 'active',
    joinedAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@grandhotel.com',
    role: 'hotel_staff',
    status: 'active',
    joinedAt: '2025-02-20',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@grandhotel.com',
    role: 'hotel_staff',
    status: 'pending',
    joinedAt: '2025-11-30',
  },
];

export default async function SettingsTeamPage() {
  await requireAuth();
  const t = await getTranslations('dashboard.settings.team');

  return (
    <div className="space-y-6">
      {/* Invite Member Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('invite.title')}</h2>
          <form className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="email" className="sr-only">
                {t('invite.emailLabel')}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder={t('invite.emailPlaceholder')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>
            <div className="w-48">
              <select
                name="role"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="hotel_staff">{t('roles.staff')}</option>
                <option value="hotel_owner">{t('roles.owner')}</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Mail className="h-4 w-4" />
              {t('invite.action')}
            </button>
          </form>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('members.title')}</h2>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members.table.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members.table.joinedAt')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockTeamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                        {member.role === 'hotel_owner' ? t('roles.owner') : t('roles.staff')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.joinedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
