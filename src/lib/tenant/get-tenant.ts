import { createClient } from '@/lib/supabase/server';

export async function getTenantBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching hotel:', error);
    return null;
  }

  return data;
}

export async function getTenantById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching hotel:', error);
    return null;
  }

  return data;
}

export async function getUserTenants(userId: string) {
  const supabase = await createClient();

  // Get all hotels where the user is the owner
  const { data, error } = await supabase
    .from('hotels')
    .select('*')
    .eq('owner_id', userId);

  if (error) {
    console.error('Error fetching user hotels:', error);
    return [];
  }

  return data || [];
}
