/**
 * Rate Plans API
 *
 * This module provides functions for managing rate plans in the hotel reservation system.
 * Rate plans define pricing strategies for different room types, date ranges, and conditions.
 */

import { SeasonalRate } from '@/components/dashboard/rates/SeasonalPricing';

// TypeScript types for rate plans
export interface RatePlan {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  roomTypeIds: string[];
  basePrice: number; // in cents
  validFrom: string; // ISO date string
  validTo: string; // ISO date string
  priority: number;
  minimumStay: number;
  maximumStay?: number;
  dayOfWeekRestrictions: number[] | null; // 0-6 for Sun-Sat
  seasonalRates: SeasonalRate[];
  cancellationPolicyId?: string;
  status: 'active' | 'inactive' | 'archived';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatePlanData {
  name: string;
  description?: string;
  roomTypeIds: string[];
  basePrice: number;
  validFrom: Date | string;
  validTo: Date | string;
  priority?: number;
  minimumStay?: number;
  maximumStay?: number;
  dayOfWeekRestrictions?: number[] | null;
  seasonalRates?: SeasonalRate[];
  cancellationPolicyId?: string;
  status?: 'active' | 'inactive';
  isDefault?: boolean;
}

export interface UpdateRatePlanData extends Partial<CreateRatePlanData> {
  id: string;
}

export interface RatePlanFilters {
  roomTypeId?: string;
  status?: 'active' | 'inactive' | 'archived';
  dateRange?: {
    start: Date | string;
    end: Date | string;
  };
  search?: string;
}

/**
 * Fetch all rate plans for a tenant
 * @param tenantId - The tenant ID
 * @param filters - Optional filters to apply
 * @returns Promise resolving to an array of rate plans
 */
export async function fetchRatePlans(
  tenantId: string,
  filters?: RatePlanFilters
): Promise<RatePlan[]> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId', tenantId);

    if (filters?.roomTypeId) {
      params.append('roomTypeId', filters.roomTypeId);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.start.toString());
      params.append('endDate', filters.dateRange.end.toString());
    }

    const response = await fetch(`/api/rates?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rate plans: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ratePlans || [];
  } catch (error) {
    console.error('Error fetching rate plans:', error);
    throw error;
  }
}

/**
 * Fetch a single rate plan by ID
 * @param id - The rate plan ID
 * @returns Promise resolving to the rate plan
 */
export async function fetchRatePlanById(id: string): Promise<RatePlan> {
  try {
    const response = await fetch(`/api/rates/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Rate plan not found');
      }
      throw new Error(`Failed to fetch rate plan: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ratePlan;
  } catch (error) {
    console.error('Error fetching rate plan:', error);
    throw error;
  }
}

/**
 * Create a new rate plan
 * @param tenantId - The tenant ID
 * @param data - The rate plan data
 * @returns Promise resolving to the created rate plan
 */
export async function createRatePlan(
  tenantId: string,
  data: CreateRatePlanData
): Promise<RatePlan> {
  try {
    // Convert dates to ISO strings if they're Date objects
    const payload = {
      ...data,
      tenantId,
      validFrom: data.validFrom instanceof Date
        ? data.validFrom.toISOString()
        : data.validFrom,
      validTo: data.validTo instanceof Date
        ? data.validTo.toISOString()
        : data.validTo,
      priority: data.priority ?? 1,
      minimumStay: data.minimumStay ?? 1,
      status: data.status ?? 'active',
      isDefault: data.isDefault ?? false,
    };

    const response = await fetch('/api/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create rate plan: ${response.statusText}`);
    }

    const result = await response.json();
    return result.ratePlan;
  } catch (error) {
    console.error('Error creating rate plan:', error);
    throw error;
  }
}

/**
 * Update an existing rate plan
 * @param id - The rate plan ID
 * @param data - The updated rate plan data
 * @returns Promise resolving to the updated rate plan
 */
export async function updateRatePlan(
  id: string,
  data: Partial<CreateRatePlanData>
): Promise<RatePlan> {
  try {
    // Convert dates to ISO strings if they're Date objects
    const payload = {
      ...data,
      validFrom: data.validFrom instanceof Date
        ? data.validFrom.toISOString()
        : data.validFrom,
      validTo: data.validTo instanceof Date
        ? data.validTo.toISOString()
        : data.validTo,
    };

    const response = await fetch(`/api/rates/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update rate plan: ${response.statusText}`);
    }

    const result = await response.json();
    return result.ratePlan;
  } catch (error) {
    console.error('Error updating rate plan:', error);
    throw error;
  }
}

/**
 * Delete a rate plan
 * @param id - The rate plan ID
 * @returns Promise resolving when the rate plan is deleted
 */
export async function deleteRatePlan(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/rates/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to delete rate plan: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting rate plan:', error);
    throw error;
  }
}

/**
 * Toggle rate plan status between active and inactive
 * @param id - The rate plan ID
 * @param status - The new status
 * @returns Promise resolving to the updated rate plan
 */
export async function toggleRatePlanStatus(
  id: string,
  status: 'active' | 'inactive'
): Promise<RatePlan> {
  return updateRatePlan(id, { status });
}

/**
 * Clone an existing rate plan
 * @param id - The rate plan ID to clone
 * @param tenantId - The tenant ID
 * @returns Promise resolving to the new cloned rate plan
 */
export async function cloneRatePlan(
  id: string,
  tenantId: string
): Promise<RatePlan> {
  try {
    const response = await fetch(`/api/rates/${id}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tenantId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to clone rate plan: ${response.statusText}`);
    }

    const result = await response.json();
    return result.ratePlan;
  } catch (error) {
    console.error('Error cloning rate plan:', error);
    throw error;
  }
}

/**
 * Calculate the effective rate for a given date and room type
 * @param ratePlanId - The rate plan ID
 * @param date - The date to calculate the rate for
 * @param roomTypeId - The room type ID
 * @returns Promise resolving to the calculated rate in cents
 */
export async function calculateEffectiveRate(
  ratePlanId: string,
  date: Date | string,
  roomTypeId: string
): Promise<number> {
  try {
    const dateStr = date instanceof Date ? date.toISOString() : date;

    const response = await fetch(
      `/api/rates/${ratePlanId}/calculate?date=${dateStr}&roomTypeId=${roomTypeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to calculate rate: ${response.statusText}`);
    }

    const data = await response.json();
    return data.effectiveRate;
  } catch (error) {
    console.error('Error calculating effective rate:', error);
    throw error;
  }
}

/**
 * Validate that a rate plan doesn't conflict with existing rate plans
 * @param tenantId - The tenant ID
 * @param data - The rate plan data to validate
 * @param excludeId - Optional rate plan ID to exclude from validation (for updates)
 * @returns Promise resolving to validation result
 */
export async function validateRatePlan(
  tenantId: string,
  data: CreateRatePlanData,
  excludeId?: string
): Promise<{ valid: boolean; conflicts?: RatePlan[] }> {
  try {
    const payload = {
      ...data,
      tenantId,
      validFrom: data.validFrom instanceof Date
        ? data.validFrom.toISOString()
        : data.validFrom,
      validTo: data.validTo instanceof Date
        ? data.validTo.toISOString()
        : data.validTo,
      excludeId,
    };

    const response = await fetch('/api/rates/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate rate plan: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating rate plan:', error);
    throw error;
  }
}
