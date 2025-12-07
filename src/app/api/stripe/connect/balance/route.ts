import { NextRequest, NextResponse } from 'next/server';
import { getAccountBalance } from '@/lib/stripe/connect';
import { createClient } from '@/lib/supabase/server';

/**
 * Get Account Balance API
 * Retrieves the balance for a hotel's Stripe Connect account
 *
 * GET /api/stripe/connect/balance?hotelId=xxx
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

    // Get balance from Stripe
    const balance = await getAccountBalance(hotel.stripe_account_id);

    return NextResponse.json(balance);
  } catch (error) {
    console.error('[Get Balance] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to retrieve account balance' },
      { status: 500 }
    );
  }
}
