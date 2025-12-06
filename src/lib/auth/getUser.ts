import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

/**
 * Get the current authenticated user in server components
 * Returns null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
