import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { TenantProvider } from '@/lib/tenant/TenantProvider';

// English translations for tests
const messages = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
  },
  booking: {
    checkIn: 'Check In',
    checkOut: 'Check Out',
    guests: 'Guests',
    adults: 'Adults',
    children: 'Children',
    search: 'Search',
    bookNow: 'Book Now',
    total: 'Total',
    perNight: 'per night',
  },
};

interface AllTheProvidersProps {
  children: ReactNode;
  locale?: string;
  tenantData?: any;
}

/**
 * Wrapper component with all necessary providers for testing
 */
function AllTheProviders({ children, locale = 'en', tenantData }: AllTheProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TenantProvider initialTenant={tenantData}>
        <AuthProvider>{children}</AuthProvider>
      </TenantProvider>
    </NextIntlClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: string;
  tenantData?: any;
}

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  { locale, tenantData, ...renderOptions }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders locale={locale} tenantData={tenantData}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Create a mock user object for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock hotel object for testing
 */
export function createMockHotel(overrides = {}) {
  return {
    id: 'test-hotel-id',
    name: 'Test Hotel',
    slug: 'test-hotel',
    description: 'A test hotel for testing',
    email: 'hotel@example.com',
    phone: '+1234567890',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    country: 'Test Country',
    postal_code: '12345',
    currency: 'USD',
    timezone: 'UTC',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock room type object for testing
 */
export function createMockRoomType(overrides = {}) {
  return {
    id: 'test-room-type-id',
    hotel_id: 'test-hotel-id',
    name: 'Standard Room',
    description: 'A comfortable standard room',
    base_price_cents: 10000, // $100.00
    currency: 'USD',
    max_adults: 2,
    max_children: 1,
    max_occupancy: 3,
    size_sqm: 25,
    beds: [{ type: 'queen', count: 1 }],
    amenities: ['wifi', 'tv', 'minibar'],
    images: ['room1.jpg'],
    total_rooms: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock booking object for testing
 */
export function createMockBooking(overrides = {}) {
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 7); // 7 days from now
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + 2); // 2 nights

  return {
    id: 'test-booking-id',
    hotel_id: 'test-hotel-id',
    room_type_id: 'test-room-type-id',
    room_id: 'test-room-id',
    user_id: 'test-user-id',
    status: 'pending',
    check_in_date: checkInDate.toISOString().split('T')[0],
    check_out_date: checkOutDate.toISOString().split('T')[0],
    num_adults: 2,
    num_children: 0,
    guest_name: 'Test Guest',
    guest_email: 'guest@example.com',
    guest_phone: '+1234567890',
    total_price_cents: 20000, // $200.00
    currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock rate plan object for testing
 */
export function createMockRatePlan(overrides = {}) {
  const today = new Date();
  const validFrom = today.toISOString().split('T')[0];
  const validTo = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  return {
    id: 'test-rate-plan-id',
    hotel_id: 'test-hotel-id',
    room_type_id: 'test-room-type-id',
    name: 'Early Bird Special',
    description: 'Book 30 days in advance for 20% off',
    price_cents: 8000, // $80.00
    is_refundable: true,
    cancellation_deadline_hours: 24,
    validity_range: `[${validFrom},${validTo})`,
    min_stay_nights: 2,
    max_stay_nights: null,
    min_advance_booking_days: 30,
    max_advance_booking_days: null,
    applicable_days: null,
    priority: 100,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Wait for async updates to complete
 */
export function waitFor(callback: () => void | Promise<void>, options = {}) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await callback();
      resolve(undefined);
    }, 0);
  });
}

/**
 * Simulate a delay (useful for testing loading states)
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
