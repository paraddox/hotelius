import { NextRequest, NextResponse } from 'next/server'
import { createConnectAccount } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type { HotelConnectAccountMetadata } from '@/lib/stripe-types'

/**
 * Create Connect Account API
 * Creates a Stripe Connect Express account for a hotel
 *
 * POST /api/stripe/connect/create-account
 * Body: { hotelId: string, country: string }
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
    const { hotelId, country } = body

    if (!hotelId || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: hotelId or country' },
        { status: 400 }
      )
    }

    // Verify user owns the hotel
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name, email, owner_id, stripe_account_id')
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

    // Check if account already exists
    if (hotel.stripe_account_id) {
      return NextResponse.json(
        {
          accountId: hotel.stripe_account_id,
          message: 'Connect account already exists',
        },
        { status: 200 }
      )
    }

    // Create metadata for the Connect account
    const metadata: HotelConnectAccountMetadata = {
      hotelId: hotel.id,
      hotelName: hotel.name,
      ownerId: user.id,
    }

    // Create Connect account
    const account = await createConnectAccount({
      email: hotel.email || user.email || '',
      country,
      metadata,
    })

    // Update hotel with Connect account ID
    const { error: updateError } = await supabase
      .from('hotels')
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hotelId)

    if (updateError) {
      console.error('[Create Connect Account] Error updating hotel:', updateError)
      // Don't fail the request, account was created successfully
    }

    return NextResponse.json({
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    })
  } catch (error) {
    console.error('[Create Connect Account] Error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create Connect account' },
      { status: 500 }
    )
  }
}
