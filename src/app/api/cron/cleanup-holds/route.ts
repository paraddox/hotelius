/**
 * Cron Endpoint: Cleanup Expired Soft Holds
 *
 * This endpoint should be called periodically (e.g., every 5 minutes) to clean up
 * expired soft holds by transitioning them to 'expired' status.
 *
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-holds",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 *
 * For local testing, you can call this endpoint directly:
 * curl http://localhost:3000/api/cron/cleanup-holds
 *
 * Security:
 * - Uses Vercel Cron secret for authentication (CRON_SECRET env var)
 * - Falls back to checking Authorization header with Bearer token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { expireBooking } from '@/lib/booking/actions';

/**
 * Verify that the request is authorized
 * Checks for Vercel Cron secret or custom authorization header
 */
function isAuthorized(request: NextRequest): boolean {
  // Check for Vercel Cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow unauthenticated requests
  if (process.env.NODE_ENV === 'development' && !cronSecret) {
    return true;
  }

  // Check Vercel cron secret
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // Reject unauthorized requests
  return false;
}

/**
 * Clean up expired soft holds
 * Finds all pending bookings with expired soft holds and marks them as expired
 */
async function cleanupExpiredHolds(): Promise<{
  success: boolean;
  expiredCount: number;
  errors: string[];
}> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const errors: string[] = [];

  // Find all pending bookings with expired soft holds
  const { data: expiredBookings, error: fetchError } = await supabase
    .from('bookings')
    .select('id, confirmation_code, soft_hold_expires_at')
    .eq('status', 'pending')
    .not('soft_hold_expires_at', 'is', null)
    .lt('soft_hold_expires_at', now)
    .order('soft_hold_expires_at', { ascending: true });

  if (fetchError) {
    console.error('Failed to fetch expired holds:', fetchError);
    return {
      success: false,
      expiredCount: 0,
      errors: [fetchError.message],
    };
  }

  if (!expiredBookings || expiredBookings.length === 0) {
    return {
      success: true,
      expiredCount: 0,
      errors: [],
    };
  }

  console.log(`Found ${expiredBookings.length} expired soft holds to clean up`);

  // Expire each booking
  let expiredCount = 0;
  for (const booking of expiredBookings) {
    try {
      // Use the expireBooking action which handles state transitions properly
      await expireBooking(booking.id);
      expiredCount++;
      console.log(
        `Expired booking ${booking.confirmation_code} (${booking.id})`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `Failed to expire booking ${booking.confirmation_code}:`,
        errorMessage
      );
      errors.push(`Booking ${booking.confirmation_code}: ${errorMessage}`);
    }
  }

  return {
    success: errors.length === 0,
    expiredCount,
    errors,
  };
}

/**
 * GET handler for the cron endpoint
 */
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const startTime = Date.now();

  try {
    console.log('Starting cleanup of expired soft holds...');

    const result = await cleanupExpiredHolds();

    const duration = Date.now() - startTime;

    console.log(
      `Cleanup completed in ${duration}ms. Expired ${result.expiredCount} bookings.`
    );

    if (!result.success) {
      console.error('Cleanup completed with errors:', result.errors);
    }

    return NextResponse.json({
      success: result.success,
      expiredCount: result.expiredCount,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cleanup failed:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler (same as GET for flexibility)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}

/**
 * Runtime configuration
 * Set maxDuration for Vercel serverless functions
 */
export const maxDuration = 60; // 60 seconds max
export const dynamic = 'force-dynamic'; // Always run dynamically, never cache
