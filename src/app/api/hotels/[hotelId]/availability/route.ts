import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAvailableRooms } from '@/lib/booking/availability';
import { calculateStayPrice } from '@/lib/booking/pricing';

/**
 * Error codes for availability API
 */
enum AvailabilityErrorCode {
  MISSING_PARAMETERS = 'MISSING_PARAMETERS',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  PAST_CHECK_IN = 'PAST_CHECK_IN',
  MINIMUM_STAY_NOT_MET = 'MINIMUM_STAY_NOT_MET',
  MAXIMUM_STAY_EXCEEDED = 'MAXIMUM_STAY_EXCEEDED',
  ADVANCE_BOOKING_TOO_SOON = 'ADVANCE_BOOKING_TOO_SOON',
  ADVANCE_BOOKING_TOO_FAR = 'ADVANCE_BOOKING_TOO_FAR',
  CLOSED_DATES = 'CLOSED_DATES',
  HOTEL_NOT_FOUND = 'HOTEL_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * API error response
 */
interface ApiError {
  error: string;
  code: AvailabilityErrorCode;
  details?: any;
}

/**
 * Check if dates fall within any closed date ranges
 */
async function checkClosedDates(
  hotelId: string,
  checkInDate: string,
  checkOutDate: string,
  roomTypeId?: string
): Promise<{
  isClosed: boolean;
  closedRanges?: Array<{ start: string; end: string; reason: string | null }>;
}> {
  const supabase = await createClient();

  // Check for closed dates that overlap with the requested stay
  // Check both hotel-wide closures (room_type_id IS NULL) and room-type-specific closures
  const query = supabase
    .from('closed_dates' as any)
    .select('closed_range, reason, room_type_id')
    .eq('hotel_id', hotelId)
    .eq('is_active', true)
    .overlaps('closed_range', `[${checkInDate},${checkOutDate})`);

  const { data: closedDates, error } = await query;

  if (error) {
    console.error('Error checking closed dates:', error);
    return { isClosed: false };
  }

  if (!closedDates || closedDates.length === 0) {
    return { isClosed: false };
  }

  // Filter to relevant closures: hotel-wide OR specific to this room type
  const relevantClosures = (closedDates as any[]).filter(
    (cd: any) => cd.room_type_id === null || cd.room_type_id === roomTypeId
  );

  if (relevantClosures.length === 0) {
    return { isClosed: false };
  }

  // Parse the closed ranges for response
  const closedRanges = relevantClosures.map((cd: any) => {
    const range = cd.closed_range;
    // PostgreSQL daterange format: "[2024-01-01,2024-01-10)"
    const matches = range.match(/[\[\(](.+?),(.+?)[\]\)]/);
    if (matches) {
      return {
        start: matches[1],
        end: matches[2],
        reason: cd.reason,
      };
    }
    return { start: '', end: '', reason: cd.reason };
  });

  return {
    isClosed: true,
    closedRanges,
  };
}

/**
 * Get applicable rate plans for validation
 */
async function getRatePlanRestrictions(
  hotelId: string,
  roomTypeId: string,
  checkInDate: string
): Promise<{
  minStayNights: number | null;
  maxStayNights: number | null;
  minAdvanceBookingDays: number | null;
  maxAdvanceBookingDays: number | null;
} | null> {
  const supabase = await createClient();

  // Calculate days in advance
  const checkIn = new Date(checkInDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInAdvance = Math.ceil(
    (checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const checkInDay = checkIn.getDay();

  // Get all active rate plans for this room type
  const { data: ratePlans, error } = await supabase
    .from('rate_plans' as any)
    .select('*')
    .eq('hotel_id', hotelId)
    .eq('room_type_id', roomTypeId)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error || !ratePlans || ratePlans.length === 0) {
    return null;
  }

  // Find the first matching rate plan based on priority
  for (const plan of (ratePlans as any[])) {
    // Check if check-in date is within validity range
    const validityRange = (plan as any).validity_range;
    const matches = validityRange.match(/[\[\(](.+?),(.+?)[\]\)]/);
    if (!matches) continue;

    const validFrom = new Date(matches[1]);
    const validTo = new Date(matches[2]);

    if (checkIn < validFrom || checkIn >= validTo) {
      continue;
    }

    // Check advance booking restrictions
    const p = plan as any;
    if (
      p.min_advance_booking_days &&
      daysInAdvance < p.min_advance_booking_days
    ) {
      continue;
    }
    if (
      p.max_advance_booking_days &&
      daysInAdvance > p.max_advance_booking_days
    ) {
      continue;
    }

    // Check day of week
    if (p.applicable_days && !p.applicable_days.includes(checkInDay)) {
      continue;
    }

    // This rate plan matches - return its restrictions
    return {
      minStayNights: p.min_stay_nights || null,
      maxStayNights: p.max_stay_nights || null,
      minAdvanceBookingDays: p.min_advance_booking_days || null,
      maxAdvanceBookingDays: p.max_advance_booking_days || null,
    };
  }

  return null;
}

/**
 * Validate booking against rate plan restrictions
 */
async function validateRatePlanRestrictions(
  hotelId: string,
  roomTypeId: string,
  checkInDate: string,
  nights: number,
  daysInAdvance: number
): Promise<{
  isValid: boolean;
  error?: ApiError;
}> {
  const restrictions = await getRatePlanRestrictions(
    hotelId,
    roomTypeId,
    checkInDate
  );

  // If no rate plan restrictions, booking is valid
  if (!restrictions) {
    return { isValid: true };
  }

  // Check minimum stay requirement
  if (restrictions.minStayNights && nights < restrictions.minStayNights) {
    return {
      isValid: false,
      error: {
        error: `Minimum stay of ${restrictions.minStayNights} night(s) required for this rate`,
        code: AvailabilityErrorCode.MINIMUM_STAY_NOT_MET,
        details: {
          requestedNights: nights,
          requiredMinimum: restrictions.minStayNights,
        },
      },
    };
  }

  // Check maximum stay restriction
  if (restrictions.maxStayNights && nights > restrictions.maxStayNights) {
    return {
      isValid: false,
      error: {
        error: `Maximum stay of ${restrictions.maxStayNights} night(s) allowed for this rate`,
        code: AvailabilityErrorCode.MAXIMUM_STAY_EXCEEDED,
        details: {
          requestedNights: nights,
          allowedMaximum: restrictions.maxStayNights,
        },
      },
    };
  }

  // Check minimum advance booking
  if (
    restrictions.minAdvanceBookingDays &&
    daysInAdvance < restrictions.minAdvanceBookingDays
  ) {
    return {
      isValid: false,
      error: {
        error: `This rate requires booking at least ${restrictions.minAdvanceBookingDays} day(s) in advance`,
        code: AvailabilityErrorCode.ADVANCE_BOOKING_TOO_SOON,
        details: {
          daysInAdvance,
          requiredMinimum: restrictions.minAdvanceBookingDays,
        },
      },
    };
  }

  // Check maximum advance booking
  if (
    restrictions.maxAdvanceBookingDays &&
    daysInAdvance > restrictions.maxAdvanceBookingDays
  ) {
    return {
      isValid: false,
      error: {
        error: `This rate can only be booked up to ${restrictions.maxAdvanceBookingDays} day(s) in advance`,
        code: AvailabilityErrorCode.ADVANCE_BOOKING_TOO_FAR,
        details: {
          daysInAdvance,
          allowedMaximum: restrictions.maxAdvanceBookingDays,
        },
      },
    };
  }

  return { isValid: true };
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
    const numAdultsStr = searchParams.get('adults') || searchParams.get('guests');
    const numChildrenStr = searchParams.get('children');

    // Validate required parameters
    if (!checkInStr || !checkOutStr) {
      const error: ApiError = {
        error: 'Missing required parameters: checkIn and checkOut are required',
        code: AvailabilityErrorCode.MISSING_PARAMETERS,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Parse dates
    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);
    const numAdults = numAdultsStr ? parseInt(numAdultsStr) : 1;
    const numChildren = numChildrenStr ? parseInt(numChildrenStr) : 0;

    // Validate date format
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      const error: ApiError = {
        error: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD)',
        code: AvailabilityErrorCode.INVALID_DATE_FORMAT,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate date range
    if (checkInDate >= checkOutDate) {
      const error: ApiError = {
        error: 'Check-out date must be after check-in date',
        code: AvailabilityErrorCode.INVALID_DATE_RANGE,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Validate check-in is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      const error: ApiError = {
        error: 'Check-in date cannot be in the past',
        code: AvailabilityErrorCode.PAST_CHECK_IN,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Calculate nights and days in advance
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysInAdvance = Math.ceil(
      (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Verify hotel exists
    const supabase = await createClient();
    const { data: hotel, error: hotelError } = await supabase
      .from('hotels')
      .select('id, name')
      .eq('id', hotelId)
      .single();

    if (hotelError || !hotel) {
      const error: ApiError = {
        error: 'Hotel not found',
        code: AvailabilityErrorCode.HOTEL_NOT_FOUND,
      };
      return NextResponse.json(error, { status: 404 });
    }

    // Format dates for database queries (YYYY-MM-DD)
    const checkInDateStr = checkInStr.split('T')[0];
    const checkOutDateStr = checkOutStr.split('T')[0];

    // Get available rooms
    const availableRoomTypes = await getAvailableRooms({
      hotelId,
      checkInDate: checkInDateStr,
      checkOutDate: checkOutDateStr,
      numAdults,
      numChildren,
    });

    // Check each room type for edge cases and add pricing
    const roomsWithValidation = await Promise.all(
      availableRoomTypes.map(async (roomType) => {
        // Check closed dates
        const closedCheck = await checkClosedDates(
          hotelId,
          checkInDateStr,
          checkOutDateStr,
          roomType.id
        );

        if (closedCheck.isClosed) {
          return {
            ...roomType,
            isAvailable: false,
            unavailableReason: 'closed_dates',
            closedDates: closedCheck.closedRanges,
          };
        }

        // Validate rate plan restrictions
        const restrictionCheck = await validateRatePlanRestrictions(
          hotelId,
          roomType.id,
          checkInDateStr,
          nights,
          daysInAdvance
        );

        if (!restrictionCheck.isValid) {
          return {
            ...roomType,
            isAvailable: false,
            unavailableReason: restrictionCheck.error?.code,
            restrictionError: restrictionCheck.error,
          };
        }

        // Calculate pricing for available room
        try {
          const pricing = await calculateStayPrice({
            hotelId,
            roomTypeId: roomType.id,
            checkInDate: checkInDateStr,
            checkOutDate: checkOutDateStr,
            numAdults,
            numChildren,
          });

          return {
            ...roomType,
            isAvailable: true,
            pricing: {
              nights: pricing.nights,
              basePriceCents: pricing.basePriceCents,
              appliedRatePlanId: pricing.appliedRatePlanId,
              subtotalCents: pricing.subtotalCents,
              taxCents: pricing.taxCents,
              totalCents: pricing.totalCents,
              currency: pricing.currency,
            },
          };
        } catch (pricingError) {
          console.error('Error calculating pricing:', pricingError);
          return {
            ...roomType,
            isAvailable: true,
            pricing: null,
          };
        }
      })
    );

    // Separate available and unavailable rooms
    const availableRooms = roomsWithValidation.filter((r) => r.isAvailable);
    const unavailableRooms = roomsWithValidation.filter((r) => !r.isAvailable);

    return NextResponse.json({
      hotelId,
      hotelName: hotel.name,
      checkIn: checkInDateStr,
      checkOut: checkOutDateStr,
      nights,
      daysInAdvance,
      guests: {
        adults: numAdults,
        children: numChildren,
        total: numAdults + numChildren,
      },
      availability: {
        hasAvailability: availableRooms.length > 0,
        availableRoomTypes: availableRooms,
        unavailableRoomTypes: unavailableRooms.length > 0 ? unavailableRooms : undefined,
      },
    });
  } catch (error) {
    console.error('Availability check error:', error);

    const apiError: ApiError = {
      error: 'Internal server error while checking availability',
      code: AvailabilityErrorCode.INTERNAL_ERROR,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    };

    return NextResponse.json(apiError, { status: 500 });
  }
}
