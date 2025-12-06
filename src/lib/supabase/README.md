# Supabase Client Utilities

This directory contains Supabase client utilities for the Hotelius hotel reservation SaaS application, built with Next.js 14+ App Router and TypeScript.

## Files

### `client.ts`
Browser client for Client Components. Use this when you need to interact with Supabase from client-side code.

**Usage:**
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyClientComponent() {
  const supabase = createClient()
  const [hotels, setHotels] = useState([])

  useEffect(() => {
    async function fetchHotels() {
      const { data } = await supabase.from('hotels').select('*')
      setHotels(data || [])
    }
    fetchHotels()
  }, [])

  return <div>{/* Your component */}</div>
}
```

### `server.ts`
Server client for Server Components, Server Actions, and Route Handlers. Use this when you need to interact with Supabase from server-side code.

**Usage in Server Components:**
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()
  const { data: hotels } = await supabase.from('hotels').select('*')

  return <div>{/* Your component */}</div>
}
```

**Usage in Server Actions:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createHotel(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hotels')
    .insert({
      name: formData.get('name') as string,
      // ... other fields
    })

  if (error) throw error
  return data
}
```

**Usage in Route Handlers:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: hotels } = await supabase.from('hotels').select('*')

  return NextResponse.json({ hotels })
}
```

### `middleware.ts`
Middleware client for auth session refresh. This is used in the root `middleware.ts` file to automatically refresh user sessions.

**Usage:**
The middleware is already set up in `/middleware.ts`. It will:
- Automatically refresh user sessions
- Keep authentication state in sync
- Protect routes (you can add custom logic)

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase project settings at:
https://app.supabase.com/project/_/settings/api

## Database Types

The database types are defined in `/src/types/database.ts`. These are placeholder types that should be replaced with generated types from your Supabase database schema.

To generate the actual types from your Supabase database:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/database.ts
```

Or if you have the Supabase CLI linked to your project:

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

## Authentication Example

### Sign Up
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function signUp(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}
```

### Sign In
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}
```

### Sign Out
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### Get Current User
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

## Best Practices

1. **Use the correct client**: Always use the server client for server-side code and the browser client for client-side code.

2. **Type safety**: The clients are typed with your database schema, providing full TypeScript autocomplete and type checking.

3. **Session management**: The middleware automatically handles session refresh, so you don't need to worry about expired sessions.

4. **Error handling**: Always handle errors from Supabase operations:
   ```typescript
   const { data, error } = await supabase.from('hotels').select('*')
   if (error) {
     console.error('Error fetching hotels:', error)
     return null
   }
   ```

5. **Row Level Security (RLS)**: Make sure to set up RLS policies in your Supabase database to protect your data.

## Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
