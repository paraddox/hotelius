import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { HotelSubscriptionMetadata } from '@/lib/stripe-types'

/**
 * Create Checkout Session API
 * Creates a Stripe Checkout session for hotel subscription
 *
 * POST /api/stripe/create-checkout-session
 * Body: { priceId: string, hotelId: string, plan: string }
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
    const { priceId, hotelId, plan } = body

    if (!priceId || !hotelId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, hotelId, or plan' },
        { status: 400 }
      )
    }

    // Verify user owns the hotel
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, owner_id, stripe_customer_id')
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

    // Get or create Stripe customer
    let customerId = hotel.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          hotelId: hotel.id,
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update hotel with customer ID
      await supabase
        .from('hotels')
        .update({ stripe_customer_id: customerId })
        .eq('id', hotelId)
    }

    // Create subscription metadata
    const metadata: HotelSubscriptionMetadata = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      plan,
    }

    // Create Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId as string,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/billing?canceled=true`,
      subscription_data: {
        metadata: metadata as unknown as Record<string, string>,
        trial_period_days: 14, // Optional: 14-day free trial
      },
      metadata: metadata as unknown as Record<string, string>,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('[Create Checkout Session] Error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
