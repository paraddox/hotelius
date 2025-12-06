# Internationalization (i18n) Setup Guide

This document provides a comprehensive guide to the next-intl setup for the Hotelius hotel reservation SaaS application.

## Overview

The application is configured with **next-intl** for internationalization, supporting 5 languages:
- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)

## File Structure

```
src/
├── i18n/
│   ├── config.ts          # i18n configuration (locales, default locale)
│   └── request.ts         # Server-side request configuration
├── messages/
│   ├── en.json           # English translations
│   ├── es.json           # Spanish translations
│   ├── fr.json           # French translations
│   ├── de.json           # German translations
│   └── it.json           # Italian translations
├── middleware.ts         # Locale detection and routing
├── components/
│   └── LocaleSwitcher.tsx # Language switcher component
└── app/
    └── [locale]/
        ├── layout.tsx    # Root layout with NextIntlClientProvider
        └── page.tsx      # Example page using translations
```

## Configuration Files

### 1. `src/i18n/config.ts`
Defines supported locales and locale display names.

### 2. `src/i18n/request.ts`
Configures next-intl for server-side rendering with dynamic message loading.

### 3. `src/middleware.ts`
Handles automatic locale detection from:
- URL path
- Accept-Language header
- Cookies

All routes are automatically prefixed with the locale (e.g., `/en/dashboard`, `/es/dashboard`).

### 4. `next.config.ts`
Updated to include the next-intl plugin.

## Translation Structure

All translation files follow the same namespace structure:

```json
{
  "common": {
    "buttons": { ... },
    "labels": { ... },
    "errors": { ... },
    "messages": { ... }
  },
  "auth": {
    "login": { ... },
    "signup": { ... },
    "forgotPassword": { ... },
    "resetPassword": { ... }
  },
  "dashboard": {
    "navigation": { ... },
    "metrics": { ... },
    "actions": { ... },
    "overview": { ... }
  },
  "booking": {
    "search": { ... },
    "rooms": { ... },
    "checkout": { ... },
    "confirmation": { ... },
    "list": { ... }
  },
  "settings": {
    "navigation": { ... },
    "hotel": { ... },
    "rooms": { ... },
    "rates": { ... },
    "policies": { ... }
  }
}
```

## Usage Examples

### In Server Components

```tsx
import { useTranslations } from 'next-intl';

export default function ServerComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('dashboard.navigation.overview')}</h1>
      <button>{t('common.buttons.save')}</button>
    </div>
  );
}
```

### In Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations();

  return (
    <button onClick={() => alert(t('common.messages.success'))}>
      {t('common.buttons.submit')}
    </button>
  );
}
```

### With Namespaces

For better organization, you can use specific namespaces:

```tsx
import { useTranslations } from 'next-intl';

export default function BookingForm() {
  const t = useTranslations('booking.checkout');

  return (
    <form>
      <h2>{t('title')}</h2>
      <input placeholder={t('firstName')} />
      <input placeholder={t('lastName')} />
      <button>{t('confirmBooking')}</button>
    </form>
  );
}
```

### With Parameters

For translations with dynamic values:

```tsx
const t = useTranslations('booking.checkout');

// Translation: "nights": "{count} night"
const nights = t('nights', { count: 3 }); // "3 nights"
```

### Using the LocaleSwitcher Component

The LocaleSwitcher component is already created and can be used anywhere:

```tsx
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation */}
      </nav>
      <LocaleSwitcher />
    </header>
  );
}
```

## Routing

All routes are automatically prefixed with the locale:

```
/en/dashboard          → English dashboard
/es/dashboard          → Spanish dashboard
/fr/reservations       → French reservations
/de/einstellungen      → German settings (if you translate the slug)
```

### Getting the Current Locale

```tsx
import { useParams } from 'next/navigation';

export default function Component() {
  const params = useParams();
  const locale = params.locale; // 'en', 'es', 'fr', 'de', or 'it'

  return <div>Current locale: {locale}</div>;
}
```

### Creating Links

Use the `Link` component with locale-aware paths:

```tsx
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Navigation() {
  const params = useParams();
  const locale = params.locale;

  return (
    <nav>
      <Link href={`/${locale}/dashboard`}>Dashboard</Link>
      <Link href={`/${locale}/bookings`}>Bookings</Link>
      <Link href={`/${locale}/settings`}>Settings</Link>
    </nav>
  );
}
```

## Adding New Translations

### 1. Add to all locale files

When adding new translations, make sure to add them to ALL locale files (en.json, es.json, fr.json, de.json, it.json):

```json
// en.json
{
  "booking": {
    "newFeature": {
      "title": "New Feature",
      "description": "This is a new feature"
    }
  }
}

// es.json
{
  "booking": {
    "newFeature": {
      "title": "Nueva característica",
      "description": "Esta es una nueva característica"
    }
  }
}
```

### 2. Use TypeScript for type safety

next-intl provides type checking for translation keys. If you add new keys, TypeScript will ensure you use them correctly.

## Best Practices

1. **Namespace Organization**: Group related translations together
2. **Consistent Keys**: Use the same structure across all locale files
3. **Avoid Hardcoded Text**: Always use translation keys, never hardcode text
4. **Plural Forms**: Use `_other` suffix for plural forms (e.g., `nights_other`)
5. **Keep It Simple**: Avoid complex logic in translation strings
6. **Context**: Provide enough context in key names (e.g., `auth.login.submitButton` instead of just `submit`)

## Testing Translations

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access different locales:
   - http://localhost:3000/en
   - http://localhost:3000/es
   - http://localhost:3000/fr
   - http://localhost:3000/de
   - http://localhost:3000/it

3. Use the LocaleSwitcher component to switch between languages

## Adding a New Language

To add a new language (e.g., Portuguese):

1. Update `src/i18n/config.ts`:
   ```ts
   export const locales = ['en', 'es', 'fr', 'de', 'it', 'pt'] as const;

   export const localeNames: Record<Locale, string> = {
     // ... existing locales
     pt: 'Português',
   };
   ```

2. Create `src/messages/pt.json` with all translations

3. The middleware will automatically handle the new locale

## Common Translation Keys Reference

### Buttons
- `common.buttons.save`
- `common.buttons.cancel`
- `common.buttons.delete`
- `common.buttons.edit`
- `common.buttons.submit`

### Errors
- `common.errors.required`
- `common.errors.invalidEmail`
- `common.errors.networkError`

### Auth
- `auth.login.title`
- `auth.signup.title`
- `auth.forgotPassword.title`

### Dashboard
- `dashboard.navigation.overview`
- `dashboard.metrics.totalBookings`
- `dashboard.actions.newBooking`

### Bookings
- `booking.search.title`
- `booking.checkout.confirmBooking`
- `booking.confirmation.title`

## Troubleshooting

### Translations not showing
1. Check that the locale file exists in `src/messages/`
2. Verify the translation key exists in the locale file
3. Ensure you're using the correct namespace

### Locale not detected
1. Clear browser cookies
2. Check middleware configuration in `src/middleware.ts`
3. Verify the locale is in the `locales` array in `src/i18n/config.ts`

### TypeScript errors
1. Run `npm run build` to regenerate types
2. Restart your TypeScript server in your IDE

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
