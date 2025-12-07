import { NextRequest, NextResponse } from 'next/server';
import { getPayouts } from '@/lib/stripe/connect';
import { createClient } from '@/lib/supabase/server';

/**
 * Get Payouts API
 * Retrieves recent payouts for a hotel's Stripe Connect account
 *
 * GET /api/stripe/connect/payouts?hotelId=xxx&limit=10
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const hotelId = searchParams.get('hotelId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Missing required parameter: hotelId' },
        { status: 400 }
      );
    }

    // Verify user owns the hotel
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, owner_id, stripe_account_id')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    if (hotel.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this hotel' },
        { status: 403 }
      );
    }

    if (!hotel.stripe_account_id) {
      return NextResponse.json(
        { error: 'No Connect account found for this hotel' },
        { status: 400 }
      );
    }

    // Get payouts from Stripe
    const payouts = await getPayouts(hotel.stripe_account_id, limit);

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('[Get Payouts] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve payouts' },
      { status: 500 }
    );
  }
}
