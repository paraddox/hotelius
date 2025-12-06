# Authentication System Documentation

This document describes the Supabase-based authentication system implemented for the Hotelius hotel reservation SaaS application.

## Overview

The authentication system provides:
- Email/password authentication
- Password reset functionality
- Role-based access control (RBAC)
- Protected routes with middleware
- Client and server-side authentication utilities
- Internationalization support

## Architecture

### File Structure

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser-side Supabase client
│   │   ├── server.ts          # Server-side Supabase client
│   │   └── middleware.ts      # Session management middleware
│   └── auth/
│       ├── getUser.ts         # Get current user in server components
│       ├── requireAuth.ts     # Protect server components
│       └── requireRole.ts     # Role-based protection
├── hooks/
│   └── useAuth.ts             # Client-side auth hook
├── components/
│   └── auth/
│       ├── AuthProvider.tsx   # Auth context provider
│       ├── LoginForm.tsx      # Login form component
│       ├── SignUpForm.tsx     # Sign up form component
│       ├── ForgotPasswordForm.tsx    # Password reset request form
│       └── ResetPasswordForm.tsx     # New password form
└── app/
    └── [locale]/
        ├── auth/
        │   ├── layout.tsx              # Auth pages layout
        │   ├── login/page.tsx          # Login page
        │   ├── signup/page.tsx         # Sign up page
        │   ├── forgot-password/page.tsx # Forgot password page
        │   ├── reset-password/page.tsx  # Reset password page
        │   └── callback/route.ts       # OAuth callback handler
        └── unauthorized/page.tsx       # Unauthorized access page
```

## Components

### 1. Supabase Clients

#### Client-side (`src/lib/supabase/client.ts`)
```typescript
import { createClient } from '@/lib/supabase/client'

// Use in client components
const supabase = createClient()
```

#### Server-side (`src/lib/supabase/server.ts`)
```typescript
import { createClient } from '@/lib/supabase/server'

// Use in server components, route handlers, and server actions
const supabase = await createClient()
```

### 2. Auth Utilities

#### Get User (`src/lib/auth/getUser.ts`)
Get the current authenticated user in server components:

```typescript
import { getUser } from '@/lib/auth/getUser'

export default async function MyPage() {
  const user = await getUser()

  if (!user) {
    // User is not authenticated
    return <div>Please log in</div>
  }

  return <div>Welcome {user.email}</div>
}
```

#### Require Auth (`src/lib/auth/requireAuth.ts`)
Protect server components and redirect if not authenticated:

```typescript
import { requireAuth } from '@/lib/auth/requireAuth'

export default async function ProtectedPage() {
  // This will redirect to /auth/login if user is not authenticated
  const user = await requireAuth()

  return <div>Protected content for {user.email}</div>
}

// With custom redirect
export default async function ProtectedPage() {
  const user = await requireAuth('/my-protected-page')
  // Redirects to /auth/login?redirectTo=/my-protected-page

  return <div>Protected content</div>
}
```

#### Require Role (`src/lib/auth/requireRole.ts`)
Protect based on user role:

```typescript
import { requireRole } from '@/lib/auth/requireRole'

export default async function AdminPage() {
  // Only allow super_admin and hotel_owner roles
  const user = await requireRole(['super_admin', 'hotel_owner'])

  return <div>Admin content for {user.email}</div>
}
```

Available roles:
- `super_admin` - System administrators
- `hotel_owner` - Hotel owners/managers
- `hotel_staff` - Hotel staff members
- `guest` - Regular guests

### 3. Client-side Auth Hook

Use the `useAuth` hook in client components:

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

export function MyComponent() {
  const { user, role, loading, signIn, signUp, signOut } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### 4. Auth Provider

Wrap your app with the AuthProvider to enable the useAuth hook:

```typescript
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Forms

All auth forms include:
- Form validation using `react-hook-form` and `zod`
- Loading states
- Error handling
- Success feedback
- Internationalization

### Login Form
- Email/password login
- "Forgot password?" link
- "Sign up" link

### Sign Up Form
- Full name, email, password fields
- Password confirmation
- Auto-assigns 'guest' role
- Email verification support

### Forgot Password Form
- Email input
- Sends password reset email
- Success confirmation

### Reset Password Form
- New password input
- Password confirmation
- Validates password strength

## Pages

### Auth Pages (`/auth/*`)
- `/auth/login` - Login page
- `/auth/signup` - Sign up page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - New password entry (from email link)
- `/auth/callback` - OAuth callback handler

All auth pages use a centered card layout defined in `src/app/[locale]/auth/layout.tsx`.

### Unauthorized Page
`/unauthorized` - Shown when user tries to access a page they don't have permission for

## Middleware

The middleware (`middleware.ts`) handles:
- Session refresh on every request
- Automatic redirect to login for unauthenticated users
- Automatic redirect to dashboard for authenticated users on auth pages

Protected routes (will redirect to login):
- All routes except:
  - `/auth/*`
  - `/_next/*` (Next.js internal)
  - `/api/*` (API routes)
  - `/` (home page)

## Internationalization

Translation keys are in `src/messages/auth-en.json` and can be accessed using `next-intl`:

```typescript
import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('auth')

  return <div>{t('signIn')}</div>
}
```

Available translation keys:
- `email`, `password`, `fullName`, `confirmPassword`, `newPassword`
- `emailPlaceholder`, `passwordPlaceholder`, etc.
- `signIn`, `signUp`, `signingIn`, `signingUp`
- `forgotPassword`, `resetPassword`, `backToLogin`
- And many more...

## Setup Instructions

### 1. Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Supabase Configuration

In your Supabase project:

1. **Enable Email Auth:**
   - Go to Authentication > Settings
   - Enable Email provider
   - Configure email templates for verification and password reset

2. **Set up User Roles:**

Create a trigger to set default role on sign up:

```sql
-- Add role to user_metadata on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Set default role to 'guest'
  NEW.raw_user_meta_data :=
    jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"guest"'::jsonb
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. **Configure Email Templates:**
   - Go to Authentication > Email Templates
   - Customize "Reset Password" template
   - Update reset password URL to: `{{ .SiteURL }}/auth/reset-password?token={{ .Token }}`

4. **Set Redirect URLs:**
   - Go to Authentication > URL Configuration
   - Add allowed redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback`

### 3. Add AuthProvider to Layout

Update your root layout to include the AuthProvider:

```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Usage Examples

### Protecting a Server Component

```typescript
import { requireAuth } from '@/lib/auth/requireAuth'

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {user.email}</p>
    </div>
  )
}
```

### Protecting a Client Component

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedComponent() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content</div>
}
```

### Checking User Role

```typescript
import { requireRole } from '@/lib/auth/requireRole'

export default async function AdminPage() {
  const user = await requireRole(['super_admin', 'hotel_owner'])

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Role: {user.role}</p>
    </div>
  )
}
```

### Custom Sign In Logic

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'

export function CustomLoginButton() {
  const { signIn } = useAuth()

  const handleLogin = async () => {
    const { error } = await signIn('user@example.com', 'password123')

    if (error) {
      console.error('Login failed:', error)
    } else {
      console.log('Login successful')
    }
  }

  return <button onClick={handleLogin}>Login</button>
}
```

## Security Best Practices

1. **Never expose service role key** - Only use in server-side code
2. **Use Row Level Security (RLS)** - Enable RLS on all Supabase tables
3. **Validate roles server-side** - Don't trust client-side role checks
4. **Use HTTPS in production** - Required for secure cookie handling
5. **Set strong password policies** - Configure in Supabase auth settings
6. **Enable email verification** - Recommended for production
7. **Implement rate limiting** - Protect against brute force attacks

## Troubleshooting

### Users not redirected after login
- Check middleware configuration
- Verify `redirectTo` parameter is set correctly
- Ensure cookies are being set properly

### Password reset emails not received
- Check Supabase email settings
- Verify email templates are configured
- Check spam folder
- Ensure redirect URLs are whitelisted

### Role-based access not working
- Verify role is stored in `user_metadata` or `app_metadata`
- Check database trigger for setting default role
- Ensure role check is server-side

### Session not persisting
- Check cookie settings in middleware
- Verify middleware is running on all routes
- Check browser cookie settings

## Next Steps

1. Customize email templates in Supabase
2. Add social auth providers (Google, GitHub, etc.)
3. Implement multi-factor authentication (MFA)
4. Add user profile management
5. Implement role management UI for admins
6. Add audit logging for auth events
7. Set up rate limiting
8. Configure custom SMTP provider for emails
