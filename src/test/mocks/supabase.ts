// @ts-nocheck
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Mock Supabase query builder
 * Provides a chainable API that matches Supabase's query builder
 */
export class MockQueryBuilder {
  private mockData: any[] = [];
  private mockError: any = null;
  private shouldCount: boolean = false;
  private headOnly: boolean = false;
  private filters: Array<{ type: string; column: string; value?: any; values?: any[]; pattern?: string }> = [];

  constructor(data: any[] = [], error: any = null) {
    this.mockData = [...data]; // Clone to avoid mutations
    this.mockError = error;
  }

  // Selection methods
  select(columns?: string, options?: { count?: string; head?: boolean }) {
    if (options?.count === 'exact') {
      this.shouldCount = true;
    }
    if (options?.head === true) {
      this.headOnly = true;
    }
    return this;
  }

  // Filter methods
  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  is(column: string, value: any) {
    this.filters.push({ type: 'is', column, value });
    return this;
  }

  overlaps(column: string, value: any) {
    this.filters.push({ type: 'overlaps', column, value });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push({ type: 'gt', column, value });
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push({ type: 'lt', column, value });
    return this;
  }

  like(column: string, pattern: string) {
    this.filters.push({ type: 'like', column, pattern });
    return this;
  }

  // Modifier methods
  order(column: string, options?: { ascending?: boolean }) {
    // Sort the data if needed
    const ascending = options?.ascending ?? true;
    this.mockData.sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(count: number) {
    return this;
  }

  range(from: number, to: number) {
    return this;
  }

  // Apply filters to data
  private applyFilters(): any[] {
    let filtered = [...this.mockData];

    for (const filter of this.filters) {
      filtered = filtered.filter(item => {
        const itemValue = item[filter.column];

        switch (filter.type) {
          case 'eq':
            return itemValue === filter.value;
          case 'neq':
            return itemValue !== filter.value;
          case 'in':
            return filter.values?.includes(itemValue) ?? false;
          case 'is':
            if (filter.value === null) {
              return itemValue === null || itemValue === undefined;
            }
            return itemValue === filter.value;
          case 'gte':
            return itemValue >= filter.value;
          case 'lte':
            return itemValue <= filter.value;
          case 'gt':
            return itemValue > filter.value;
          case 'lt':
            return itemValue < filter.value;
          case 'like':
            if (typeof itemValue !== 'string') return false;
            const pattern = filter.pattern?.replace(/%/g, '.*') ?? '';
            return new RegExp(pattern, 'i').test(itemValue);
          case 'overlaps':
            // For date range overlaps, return true by default in tests
            // Real implementation would check range intersection
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  // Result methods
  async single() {
    if (this.mockError) {
      return { data: null, error: this.mockError };
    }
    const filtered = this.applyFilters();
    if (filtered.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'No rows found' } };
    }
    return { data: filtered[0], error: null };
  }

  async maybeSingle() {
    if (this.mockError) {
      return { data: null, error: this.mockError };
    }
    const filtered = this.applyFilters();
    return { data: filtered[0] || null, error: null };
  }

  then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    if (this.mockError) {
      return Promise.reject(this.mockError).then(resolve, reject);
    }

    const filtered = this.applyFilters();
    const count = this.shouldCount ? filtered.length : null;
    const data = this.headOnly ? null : filtered;

    return Promise.resolve({
      data,
      error: null,
      count,
    }).then(resolve, reject);
  }

  // Insert/Update/Delete
  async insert(values: any) {
    if (this.mockError) {
      return { data: null, error: this.mockError };
    }
    const inserted = Array.isArray(values) ? values : [values];
    return { data: inserted, error: null };
  }

  async update(values: any) {
    if (this.mockError) {
      return { data: null, error: this.mockError };
    }
    return { data: this.mockData, error: null };
  }

  async delete() {
    if (this.mockError) {
      return { data: null, error: this.mockError };
    }
    return { data: this.mockData, error: null };
  }

  async upsert(values: any) {
    if (this.mockError) {
      return { data: null, error: this.mockError };
    }
    const upserted = Array.isArray(values) ? values : [values];
    return { data: upserted, error: null };
  }
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient(options: {
  data?: Record<string, any[]>;
  errors?: Record<string, any>;
} = {}): Partial<SupabaseClient> {
  const { data = {}, errors = {} } = options;

  return {
    from: vi.fn((table: string) => {
      const tableData = data[table] || [];
      const tableError = errors[table] || null;
      return new MockQueryBuilder(tableData, tableError);
    }),
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      })),
      getSession: vi.fn(async () => ({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: {},
              app_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            },
          },
        },
        error: null,
      })),
      signInWithPassword: vi.fn(async ({ email, password }) => ({
        data: {
          user: {
            id: 'test-user-id',
            email,
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
            token_type: 'bearer',
          },
        },
        error: null,
      })),
      signUp: vi.fn(async ({ email, password }) => ({
        data: {
          user: {
            id: 'test-user-id',
            email,
            user_metadata: {},
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
          session: null,
        },
        error: null,
      })),
      signOut: vi.fn(async () => ({
        error: null,
      })),
      onAuthStateChange: vi.fn((callback) => {
        // Return unsubscribe function
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        };
      }),
    } as any,
    storage: {
      from: vi.fn((bucket: string) => ({
        upload: vi.fn(async (path: string, file: File) => ({
          data: { path },
          error: null,
        })),
        download: vi.fn(async (path: string) => ({
          data: new Blob(),
          error: null,
        })),
        remove: vi.fn(async (paths: string[]) => ({
          data: paths,
          error: null,
        })),
        getPublicUrl: vi.fn((path: string) => ({
          data: { publicUrl: `https://test.supabase.co/storage/v1/object/public/${bucket}/${path}` },
        })),
        createSignedUrl: vi.fn(async (path: string, expiresIn: number) => ({
          data: {
            signedUrl: `https://test.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=test`,
          },
          error: null,
        })),
      })),
    } as any,
    rpc: vi.fn(async (functionName: string, params?: any) => ({
      data: null,
      error: null,
    })),
  } as Partial<SupabaseClient>;
}

/**
 * Helper to create mock data for specific scenarios
 */
export const mockData = {
  /**
   * Create mock hotel data
   */
  hotels: (count = 1) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `a0000000-0000-4000-a000-00000000000${i + 1}`,
      name: `Test Hotel ${i + 1}`,
      slug: `test-hotel-${i + 1}`,
      description: 'A test hotel',
      email: `hotel${i + 1}@example.com`,
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
    }));
  },

  /**
   * Create mock room type data
   */
  roomTypes: (count = 1, hotelId = 'a0000000-0000-4000-a000-000000000001') => {
    return Array.from({ length: count }, (_, i) => ({
      id: `b0000000-0000-4000-a000-00000000000${i + 1}`,
      hotel_id: hotelId,
      name: `Room Type ${i + 1}`,
      name_default: `Room Type ${i + 1}`,
      description: 'A test room type',
      base_price_cents: 10000 + i * 1000,
      currency: 'USD',
      max_adults: 2,
      max_children: 1,
      max_occupancy: 3,
      size_sqm: 25,
      beds: [{ type: 'queen', count: 1 }],
      amenities: ['wifi', 'tv'],
      images: [`room${i + 1}.jpg`],
      total_rooms: 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  },

  /**
   * Create mock room data
   */
  rooms: (count = 1, roomTypeId = 'b0000000-0000-4000-a000-000000000001', hotelId = 'a0000000-0000-4000-a000-000000000001') => {
    return Array.from({ length: count }, (_, i) => ({
      id: `d0000000-0000-4000-a000-00000000000${i + 1}`,
      hotel_id: hotelId,
      room_type_id: roomTypeId,
      room_number: `${100 + i + 1}`,
      floor: 1,
      is_active: true,
      is_available: true,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  },

  /**
   * Create mock booking data
   */
  bookings: (count = 1, status = 'pending') => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    return Array.from({ length: count }, (_, i) => ({
      id: `e0000000-0000-4000-a000-00000000000${i + 1}`,
      hotel_id: 'a0000000-0000-4000-a000-000000000001',
      room_type_id: 'b0000000-0000-4000-a000-000000000001',
      room_id: `d0000000-0000-4000-a000-00000000000${i + 1}`,
      user_id: 'test-user-id',
      status,
      check_in_date: checkIn.toISOString().split('T')[0],
      check_out_date: checkOut.toISOString().split('T')[0],
      stay_range: `[${checkIn.toISOString().split('T')[0]},${checkOut.toISOString().split('T')[0]})`,
      num_adults: 2,
      num_children: 0,
      guest_name: 'Test Guest',
      guest_email: 'guest@example.com',
      guest_phone: '+1234567890',
      total_price_cents: 20000,
      currency: 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  },

  /**
   * Create mock rate plan data
   */
  ratePlans: (count = 1, hotelId = 'a0000000-0000-4000-a000-000000000001', roomTypeId = 'b0000000-0000-4000-a000-000000000001') => {
    const today = new Date();
    const validFrom = today.toISOString().split('T')[0];
    const validTo = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];

    return Array.from({ length: count }, (_, i) => ({
      id: `c0000000-0000-4000-a000-00000000000${i + 1}`,
      hotel_id: hotelId,
      room_type_id: roomTypeId,
      name: `Rate Plan ${i + 1}`,
      description: 'A test rate plan',
      price_cents: 8000 + i * 1000,
      is_refundable: true,
      cancellation_deadline_hours: 24,
      validity_range: `[${validFrom},${validTo})`,
      min_stay_nights: 2,
      max_stay_nights: null,
      min_advance_booking_days: 30,
      max_advance_booking_days: null,
      applicable_days: null,
      priority: 100 - i * 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  },
};
