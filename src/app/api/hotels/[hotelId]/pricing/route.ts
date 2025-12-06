import { NextRequest, NextResponse } from 'next/server';

// Mock function to calculate dynamic pricing
// In production, this would apply complex pricing rules
async function calculatePricing(
  hotelId: string,
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
) {
  // TODO: Replace with actual pricing logic
  // Consider:
  // - Base room rates
  // - Seasonal pricing
  // - Demand-based pricing
  // - Length of stay discounts
  // - Special offers/promotions
  // - Guest count surcharges

  const baseRates: Record<string, number> = {
    '1': 150,
    '2': 280,
    '3': 500,
  };

  const baseRate = baseRates[roomTypeId] || 150;
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Apply seasonal multiplier (example)
  const month = checkIn.getMonth();
  let seasonalMultiplier = 1.0;

  // Higher rates in summer (June, July, August)
  if (month >= 5 && month <= 7) {
    seasonalMultiplier = 1.2;
  }
  // Higher rates in winter holidays (December)
  else if (month === 11) {
    seasonalMultiplier = 1.3;
  }

  // Length of stay discount
  let stayDiscount = 0;
  if (nights >= 7) {
    stayDiscount = 0.15; // 15% discount for 7+ nights
  } else if (nights >= 3) {
    stayDiscount = 0.05; // 5% discount for 3-6 nights
  }

  const adjustedRate = baseRate * seasonalMultiplier;
  const subtotal = adjustedRate * nights;
  const discountAmount = subtotal * stayDiscount;
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Taxes and fees
  const taxRate = 0.10; // 10% tax
  const serviceFee = 20; // Flat service fee
  const tax = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + tax + serviceFee;

  return {
    baseRate,
    adjustedRate,
    nights,
    subtotal,
    discounts: {
      lengthOfStay: discountAmount,
    },
    subtotalAfterDiscount,
    tax,
    serviceFee,
    total,
    breakdown: [
      {
        type: 'room',
        description: `Room rate (${nights} ${nights === 1 ? 'night' : 'nights'})`,
        amount: subtotal,
      },
      ...(discountAmount > 0
        ? [
            {
              type: 'discount',
              description: 'Length of stay discount',
              amount: -discountAmount,
            },
          ]
        : []),
      {
        type: 'tax',
        description: 'Taxes',
        amount: tax,
      },
      {
        type: 'fee',
        description: 'Service fee',
        amount: serviceFee,
      },
    ],
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await context.params;
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const roomTypeId = searchParams.get('roomTypeId');
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const guestsStr = searchParams.get('guests');

    // Validate required parameters
    if (!roomTypeId || !checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: roomTypeId, checkIn, and checkOut are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);
    const guests = guestsStr ? parseInt(guestsStr) : 1;

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = await calculatePricing(
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      guests
    );

    return NextResponse.json({
      hotelId,
      roomTypeId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests,
      pricing,
    });
  } catch (error) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
