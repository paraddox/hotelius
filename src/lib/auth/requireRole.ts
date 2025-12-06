import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export type UserRole = 'super_admin' | 'hotel_owner' | 'hotel_staff' | 'guest'

interface UserWithRole extends User {
  role?: UserRole
}

/**
 * Require specific role(s) in server components
 * Redirects to unauthorized page if user doesn't have required role
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @param redirectTo - Optional URL to redirect to if unauthorized (defaults to /unauthorized)
 */
export async function requireRole(
  allowedRoles: UserRole[],
  redirectTo: string = '/unauthorized'
): Promise<UserWithRole> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user role from user_metadata or app_metadata
  const role = (user.user_metadata?.role || user.app_metadata?.role) as UserRole | undefined

  if (!role || !allowedRoles.includes(role)) {
    redirect(redirectTo)
  }

  return { ...user, role }
}
