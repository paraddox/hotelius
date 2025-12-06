# Authentication Quick Reference

Quick reference guide for common authentication tasks in Hotelius.

## Import Statements

```typescript
// Server-side
import { getUser } from '@/lib/auth/getUser'
import { requireAuth } from '@/lib/auth/requireAuth'
import { requireRole } from '@/lib/auth/requireRole'
import { createClient } from '@/lib/supabase/server'

// Client-side
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
```

## Server Components

### Get User (Optional Auth)
```typescript
const user = await getUser()
if (!user) {
  // Handle unauthenticated state
}
```

### Require Auth
```typescript
// Basic - redirects to /auth/login
const user = await requireAuth()

// With redirect back
const user = await requireAuth('/my-page')
```

### Require Role
```typescript
// Single role
const user = await requireRole(['super_admin'])

// Multiple roles
const user = await requireRole(['super_admin', 'hotel_owner'])

// Custom redirect
const user = await requireRole(['admin'], '/custom-unauthorized')
```

## Client Components

### useAuth Hook
```typescript
const {
  user,        // User object or null
  role,        // User role or null
  loading,     // Boolean
  signIn,      // (email, password) => Promise
  signUp,      // (email, password, metadata?) => Promise
  signOut,     // () => Promise
  resetPassword,   // (email) => Promise
  updatePassword,  // (newPassword) => Promise
} = useAuth()
```

### Common Patterns

#### Protected Component
```typescript
if (loading) return <div>Loading...</div>
if (!user) return <div>Please sign in</div>
return <div>Protected content</div>
```

#### Conditional Rendering
```typescript
{user ? (
  <UserMenu user={user} />
) : (
  <LoginButton />
)}
```

#### Sign In
```typescript
const { error } = await signIn(email, password)
if (error) {
  // Handle error
}
```

#### Sign Up
```typescript
const { error } = await signUp(email, password, {
  full_name: 'John Doe',
  role: 'guest',
})
```

#### Sign Out
```typescript
await signOut()
router.push('/')
```

## User Roles

- `super_admin` - Full system access
- `hotel_owner` - Hotel management
- `hotel_staff` - Staff operations
- `guest` - Basic user (default)

## Routes

### Auth Pages
- `/auth/login` - Login
- `/auth/signup` - Sign up
- `/auth/forgot-password` - Reset request
- `/auth/reset-password` - New password

### Other
- `/unauthorized` - Access denied
- `/dashboard` - Default redirect after login

## Form Validation (Zod)

### Login Schema
```typescript
z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
```

### Sign Up Schema
```typescript
z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword)
```

## Translations (next-intl)

```typescript
const t = useTranslations('auth')

t('signIn')              // "Sign In"
t('email')               // "Email"
t('password')            // "Password"
t('forgotPassword')      // "Forgot password?"
t('dontHaveAccount')     // "Don't have an account?"
```

## Common Tasks

### Check if User is Admin
```typescript
// Server
const user = await requireRole(['super_admin', 'hotel_owner'])

// Client
const { role } = useAuth()
const isAdmin = role === 'super_admin' || role === 'hotel_owner'
```

### Get User in API Route
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Update User Metadata
```typescript
const supabase = createClient()
await supabase.auth.updateUser({
  data: { full_name: 'New Name' }
})
```

### Fetch User-Specific Data
```typescript
const supabase = await createClient()
const user = await requireAuth()

const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('user_id', user.id)
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

## Supabase Setup Checklist

- [ ] Enable Email Auth
- [ ] Configure email templates
- [ ] Set redirect URLs
- [ ] Create role assignment trigger
- [ ] Set password policy
- [ ] Enable email verification (optional)
- [ ] Configure SMTP (optional)

## Testing

### Test Login
```bash
# Navigate to
http://localhost:3000/auth/login

# Create account at
http://localhost:3000/auth/signup
```

### Test Protected Route
```bash
# Should redirect to login
http://localhost:3000/dashboard

# After login, should show dashboard
```

### Test Role Protection
```bash
# Should show unauthorized
http://localhost:3000/admin
```

## Common Errors

### "User not found"
- Check if user exists in Supabase
- Verify email/password

### "Invalid token"
- Reset password link expired
- Request new reset link

### "Unauthorized"
- User not logged in
- Session expired
- Check middleware config

### "Access denied"
- User lacks required role
- Check role assignment

## Performance Tips

1. Use `getUser()` for optional auth (no redirect)
2. Use `requireAuth()` for protected pages (auto redirect)
3. Combine auth checks with data fetching
4. Cache user data when appropriate
5. Use middleware for route protection

## Security Reminders

1. Never trust client-side role checks
2. Always validate on server
3. Use RLS in Supabase
4. Don't expose service role key
5. Enable HTTPS in production
6. Implement rate limiting
7. Validate all inputs
8. Use secure cookies

## File Locations

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── auth/
│       ├── getUser.ts
│       ├── requireAuth.ts
│       └── requireRole.ts
├── hooks/
│   └── useAuth.ts
├── components/
│   └── auth/
│       ├── AuthProvider.tsx
│       ├── LoginForm.tsx
│       ├── SignUpForm.tsx
│       ├── ForgotPasswordForm.tsx
│       └── ResetPasswordForm.tsx
└── app/
    └── [locale]/
        └── auth/
            ├── layout.tsx
            ├── login/page.tsx
            ├── signup/page.tsx
            ├── forgot-password/page.tsx
            ├── reset-password/page.tsx
            └── callback/route.ts
```

## Documentation

- `AUTH_SETUP.md` - Complete setup guide
- `USAGE_EXAMPLES.md` - Code examples
- `AUTH_FILES_SUMMARY.md` - File listing
- `AUTH_QUICK_REFERENCE.md` - This file

## Support Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Auth Guide](https://nextjs.org/docs/app/building-your-application/authentication)
- [react-hook-form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
