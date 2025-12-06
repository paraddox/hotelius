import { NextRequest, NextResponse } from 'next/server';

// Type definitions
interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

interface BookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestInfo: GuestInfo;
  paymentIntentId?: string; // Stripe PaymentIntent ID
}

// Mock function to create a booking
// In production, this would:
// 1. Verify room availability
// 2. Create booking record in database
// 3. Process payment via Stripe
// 4. Send confirmation email
// 5. Update room inventory
async function createBooking(data: BookingRequest) {
  // TODO: Replace with actual database operations
  // Example with Supabase:
  /*
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      hotel_id: data.hotelId,
      room_id: data.roomId,
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests: data.guests,
      guest_first_name: data.guestInfo.firstName,
      guest_last_name: data.guestInfo.lastName,
      guest_email: data.guestInfo.email,
      guest_phone: data.guestInfo.phone,
      special_requests: data.guestInfo.specialRequests,
      status: 'confirmed',
      payment_intent_id: data.paymentIntentId,
    })
    .select()
    .single();

  if (error) throw error;
  return booking;
  */

  // Simulate booking creation
  const bookingId = 'bk_' + Math.random().toString(36).substring(2, 15);
  const reference = 'BK-' + bookingId.substring(3, 11).toUpperCase();

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate pricing (should match pricing API)
  const baseRate = 150; // TODO: Get from room data
  const subtotal = baseRate * nights;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return {
    id: bookingId,
    reference,
    status: 'confirmed',
    hotelId: data.hotelId,
    roomId: data.roomId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
    nights,
    guestInfo: data.guestInfo,
    pricing: {
      subtotal,
      tax,
      total,
    },
    createdAt: new Date().toISOString(),
  };
}

// Mock function to send confirmation email
async function sendConfirmationEmail(booking: any) {
  // TODO: Implement email sending
  // Example with SendGrid, Resend, or similar:
  /*
  await sendEmail({
    to: booking.guestInfo.email,
    subject: `Booking Confirmation - ${booking.reference}`,
    template: 'booking-confirmation',
    data: booking,
  });
  */

  console.log('Confirmation email would be sent to:', booking.guestInfo.email);
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();

    // Validate required fields
    if (!body.hotelId || !body.roomId || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.guestInfo?.firstName || !body.guestInfo?.lastName || !body.guestInfo?.email) {
      return NextResponse.json(
        { error: 'Missing required guest information' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

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

    // TODO: Verify room availability
    // const isAvailable = await checkAvailability(body.hotelId, body.roomId, checkIn, checkOut);
    // if (!isAvailable) {
    //   return NextResponse.json(
    //     { error: 'Room is not available for selected dates' },
    //     { status: 409 }
    //   );
    // }

    // TODO: Process payment via Stripe
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(total * 100), // Amount in cents
    //   currency: 'usd',
    //   metadata: {
    //     hotelId: body.hotelId,
    //     roomId: body.roomId,
    //     guestEmail: body.guestInfo.email,
    //   },
    // });

    // Create booking
    const booking = await createBooking(body);

    // Send confirmation email
    await sendConfirmationEmail(booking);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET - Retrieve bookings (for guest account)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const guestEmail = searchParams.get('guestEmail');
    const bookingId = searchParams.get('bookingId');

    // TODO: Add authentication to verify the user can access these bookings
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    if (!guestEmail && !bookingId) {
      return NextResponse.json(
        { error: 'Either guestEmail or bookingId is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    // Example with Supabase:
    /*
    if (bookingId) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('guest_email', guestEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }
    */

    // Mock response
    const mockBookings = [
      {
        id: '1',
        reference: 'BK-ABC123',
        status: 'confirmed',
        hotelId: '1',
        roomId: '1',
        checkIn: '2025-02-15',
        checkOut: '2025-02-18',
        guests: 2,
      },
    ];

    return NextResponse.json(mockBookings);
  } catch (error) {
    console.error('Booking retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve bookings' },
      { status: 500 }
    );
  }
}
