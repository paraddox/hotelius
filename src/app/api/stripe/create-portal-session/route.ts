import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * Create Billing Portal Session API
 * Creates a Stripe Customer Portal session for managing subscription
 *
 * POST /api/stripe/create-portal-session
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
      .select('id, owner_id, stripe_customer_id')
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

    if (!hotel.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: hotel.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing`,
    })

    return NextResponse.json({
      url: session.url,
    })
  } catch (error) {
    console.error('[Create Portal Session] Error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
