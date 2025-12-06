import { NextRequest, NextResponse } from 'next/server'
import { createAccountLink } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * Create Account Link API
 * Generates a Stripe Connect onboarding link for a hotel
 *
 * POST /api/stripe/connect/account-link
 * Body: { hotelId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { hotelId } = body

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Missing required field: hotelId' },
        { status: 400 }
      )
    }

    // Verify user owns the hotel
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, owner_id, stripe_account_id')
      .eq('id', hotelId)
      .single()

    if (hotelError || !hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    if (hotel.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this hotel' },
        { status: 403 }
      )
    }

    if (!hotel.stripe_account_id) {
      return NextResponse.json(
        { error: 'No Connect account found. Please create one first.' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create account link for onboarding
    const accountLink = await createAccountLink({
      accountId: hotel.stripe_account_id,
      refreshUrl: `${baseUrl}/dashboard/settings/payments?refresh=true`,
      returnUrl: `${baseUrl}/dashboard/settings/payments?success=true`,
    })

    return NextResponse.json({
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    })
  } catch (error) {
    console.error('[Create Account Link] Error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account link' },
      { status: 500 }
    )
  }
}
