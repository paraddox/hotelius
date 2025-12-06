import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * Create Dashboard Link API
 * Generates a Stripe Express Dashboard login link for a hotel
 *
 * POST /api/stripe/connect/dashboard-link
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
      .select('id, owner_id, stripe_account_id, stripe_onboarding_complete')
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

    if (!hotel.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Complete onboarding before accessing the dashboard' },
        { status: 400 }
      )
    }

    // Create Express Dashboard login link
    const loginLink = await stripe.accounts.createLoginLink(
      hotel.stripe_account_id
    )

    return NextResponse.json({
      url: loginLink.url,
    })
  } catch (error) {
    console.error('[Create Dashboard Link] Error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create dashboard link' },
      { status: 500 }
    )
  }
}
