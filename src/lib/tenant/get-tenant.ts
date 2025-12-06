import { createClient } from '@/lib/supabase/server';

export async function getTenantBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }

  return data;
}

export async function getTenantById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }

  return data;
}

export async function getUserTenants(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tenant_users')
    .select(`
      role,
      tenant:tenants(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user tenants:', error);
    return [];
  }

  return data;
}
