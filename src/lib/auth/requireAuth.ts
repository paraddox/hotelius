import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/unauthorized');
  }

  return { user, profile };
}
