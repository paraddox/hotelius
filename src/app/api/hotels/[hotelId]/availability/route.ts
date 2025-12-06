import { NextRequest, NextResponse } from 'next/server';

// Mock function to check room availability
// In production, this would query your database
async function checkRoomAvailability(
  hotelId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
) {
  // TODO: Replace with actual database query
  // Example: Query Supabase for available rooms

  // Simulate database query
  const availableRooms = [
    {
      id: '1',
      roomTypeId: 'deluxe',
      name: 'Deluxe Room',
      description: 'Spacious room with city views',
      maxGuests: 2,
      available: 5,
      basePrice: 150,
    },
    {
      id: '2',
      roomTypeId: 'executive',
      name: 'Executive Suite',
      description: 'Luxury suite with separate living area',
      maxGuests: 4,
      available: 3,
      basePrice: 280,
    },
    {
      id: '3',
      roomTypeId: 'presidential',
      name: 'Presidential Suite',
      description: 'Ultimate luxury with panoramic views',
      maxGuests: 4,
      available: 1,
      basePrice: 500,
    },
  ];

  // Filter rooms by guest count
  return availableRooms.filter((room) => room.maxGuests >= guests);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ hotelId: string }> }
) {
  try {
    const { hotelId } = await context.params;
    const searchParams = request.nextUrl.searchParams;

    // Extract query parameters
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');
    const guestsStr = searchParams.get('guests');

    // Validate required parameters
    if (!checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: 'Missing required parameters: checkIn and checkOut are required' },
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

    if (checkIn < new Date()) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    // Check availability
    const availableRooms = await checkRoomAvailability(
      hotelId,
      checkIn,
      checkOut,
      guests
    );

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      hotelId,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      guests,
      nights,
      availableRooms,
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
