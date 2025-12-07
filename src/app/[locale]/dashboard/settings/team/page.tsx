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
      <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-serif font-medium text-[var(--foreground)] mb-4">{t('invite.title')}</h2>
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
                className="block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
              />
            </div>
            <div className="w-48">
              <select
                name="role"
                className="block w-full rounded-lg border-[var(--color-sand)] shadow-sm focus:border-[var(--color-terracotta)] focus:ring-[var(--color-terracotta)] sm:text-sm px-3 py-2 border bg-[var(--background)] text-[var(--foreground)] transition-all duration-200"
              >
                <option value="hotel_staff">{t('roles.staff')}</option>
                <option value="hotel_owner">{t('roles.owner')}</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-charcoal)] px-4 py-2 text-sm font-semibold text-[var(--color-pearl)] shadow-sm hover:bg-[var(--color-slate)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-charcoal)] transition-all duration-200"
            >
              <Mail className="h-4 w-4" />
              {t('invite.action')}
            </button>
          </form>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-[var(--background-elevated)] shadow rounded-xl border border-[var(--color-sand)] transition-all duration-200">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-serif font-medium text-[var(--foreground)] mb-4">{t('members.title')}</h2>

          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-[var(--color-sand)]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('members.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('members.table.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('members.table.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('members.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('members.table.joinedAt')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                    {t('members.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background-elevated)] divide-y divide-[var(--color-sand)]">
                {mockTeamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[var(--color-sand)]/20 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-[var(--color-terracotta)]/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-[var(--color-terracotta-dark)]">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-[var(--foreground)]">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                      <span className="inline-flex rounded-full bg-[var(--color-sand)]/50 px-2 text-xs font-semibold leading-5 text-[var(--foreground)]">
                        {member.role === 'hotel_owner' ? t('roles.owner') : t('roles.staff')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          member.status === 'active'
                            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                            : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground-muted)]">
                      {member.joinedAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        className="text-[var(--color-error)] hover:text-[var(--color-error)]/80 transition-all duration-200"
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
