import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { ReservationPaymentMetadata } from '@/lib/stripe-types'

/**
 * Platform fee configuration
 * 10% platform fee with minimum of $2.00
 */
const PLATFORM_FEE_PERCENTAGE = 10
const PLATFORM_FEE_MINIMUM = 200 // $2.00 in cents

/**
 * Calculate platform fee
 * @param amount - Total booking amount in cents
 * @returns Platform fee amount in cents
 */
function calculatePlatformFee(amount: number): number {
  const percentageFee = Math.round(amount * (PLATFORM_FEE_PERCENTAGE / 100))
  return Math.max(percentageFee, PLATFORM_FEE_MINIMUM)
}

/**
 * Create Payment Intent API
 * Creates a Stripe Payment Intent for a booking with application fee
 *
 * POST /api/bookings/create-payment-intent
 * Body: { bookingId: string }
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
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing required field: bookingId' },
        { status: 400 }
      )
    }

    // Get booking details with hotel information
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        guest_id,
        hotel_id,
        total_price_cents,
        currency,
        check_in_date,
        check_out_date,
        status,
        payment_status,
        stripe_payment_intent_id,
        hotels (
          id,
          name,
          stripe_account_id,
          stripe_onboarding_complete
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify user is the guest making the booking
    if (booking.guest_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: This is not your booking' },
        { status: 403 }
      )
    }

    // Check if booking already has a payment intent
    if (booking.stripe_payment_intent_id && booking.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'Booking has already been paid' },
        { status: 400 }
      )
    }

    // Verify hotel has completed Stripe Connect onboarding
    const hotel = booking.hotels as any
    if (!hotel?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Hotel payment processing not configured' },
        { status: 400 }
      )
    }

    if (!hotel.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: 'Hotel has not completed payment setup' },
        { status: 400 }
      )
    }

    // Calculate amounts (total_price_cents is already in cents)
    const totalAmount = booking.total_price_cents
    const platformFee = calculatePlatformFee(totalAmount)

    // Create payment metadata
    const metadata: ReservationPaymentMetadata = {
      reservationId: booking.id,
      hotelId: booking.hotel_id,
      guestId: booking.guest_id,
      checkIn: booking.check_in_date,
      checkOut: booking.check_out_date,
      roomCount: '1', // You might want to get this from the booking
    }

    // Create payment intent with Connect
    const paymentIntent = await createPaymentIntent({
      amount: totalAmount,
      currency: booking.currency.toLowerCase(),
      connectedAccountId: hotel.stripe_account_id,
      applicationFeeAmount: platformFee,
      metadata: metadata as unknown as Record<string, string>,
    })

    // Update booking with payment intent ID
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('[Create Payment Intent] Error updating booking:', updateError)
      // Don't fail the request, payment intent was created successfully
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      currency: booking.currency,
      platformFee,
    })
  } catch (error) {
    console.error('[Create Payment Intent] Error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
