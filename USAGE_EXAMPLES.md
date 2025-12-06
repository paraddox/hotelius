# next-intl Usage Examples for Hotelius

This document provides practical examples of using next-intl in your Hotelius application.

## Basic Import

```tsx
import { useTranslations } from 'next-intl';
```

## Example 1: Simple Component

```tsx
export default function WelcomeMessage() {
  const t = useTranslations('dashboard.home');
  
  return <h1>{t('title')}</h1>;
}
```

## Example 2: Using Multiple Namespaces

```tsx
export default function BookingForm() {
  const t = useTranslations('booking.checkout');
  const tCommon = useTranslations('common');
  
  return (
    <form>
      <input placeholder={t('firstName')} />
      <button>{tCommon('buttons.submit')}</button>
    </form>
  );
}
```

## Example 3: Navigation with LocaleSwitcher

```tsx
import LocaleSwitcher from '@/components/LocaleSwitcher';

export default function Header() {
  return (
    <header>
      <nav>Navigation</nav>
      <LocaleSwitcher />
    </header>
  );
}
```

## Example 4: Using Link Component

```tsx
import { Link } from '@/lib/i18n/navigation';

export default function Menu() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/bookings">Bookings</Link>
    </nav>
  );
}
```

## Tips

1. Use scoped namespaces for better organization
2. Test all locales during development
3. Use the locale-aware Link component
4. Keep translation keys consistent across all files
