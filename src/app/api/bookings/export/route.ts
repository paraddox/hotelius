import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Escapes special characters in CSV fields
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }

  const stringField = String(field);

  // If the field contains comma, quote, or newline, wrap it in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Converts an array of objects to CSV format
 */
function convertToCSV(data: any[]): string {
  if (data.length === 0) {
    return 'Reference,Guest Name,Email,Room,Room Type,Check-In,Check-Out,Status,Payment Status,Total\n';
  }

  // Define headers
  const headers = [
    'Reference',
    'Guest Name',
    'Email',
    'Phone',
    'Room Number',
    'Room Type',
    'Check-In',
    'Check-Out',
    'Nights',
    'Guests',
    'Status',
    'Payment Status',
    'Total',
    'Currency',
    'Created At',
  ];

  // Create CSV header row
  const headerRow = headers.join(',');

  // Create CSV data rows
  const dataRows = data.map((booking) => {
    const row = [
      escapeCSVField(booking.id),
      escapeCSVField(booking.guest_name),
      escapeCSVField(booking.guest_email),
      escapeCSVField(booking.guest_phone),
      escapeCSVField(booking.room_number),
      escapeCSVField(booking.room_type),
      escapeCSVField(booking.check_in_date),
      escapeCSVField(booking.check_out_date),
      escapeCSVField(booking.nights),
      escapeCSVField(booking.number_of_guests),
      escapeCSVField(booking.status),
      escapeCSVField(booking.payment_status),
      escapeCSVField(booking.total_price),
      escapeCSVField(booking.currency),
      escapeCSVField(new Date(booking.created_at).toISOString().split('T')[0]),
    ];

    return row.join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * GET /api/bookings/export
 *
 * Exports bookings to CSV format with optional filters
 *
 * Query parameters:
 * - dateRange: 'today' | 'week' | 'month' | 'all' (optional)
 * - status: booking status filter (optional)
 * - startDate: custom start date in YYYY-MM-DD format (optional)
 * - endDate: custom end date in YYYY-MM-DD format (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        created_at,
        check_in_date,
        check_out_date,
        number_of_guests,
        total_price,
        currency,
        status,
        payment_status,
        rooms (
          room_number,
          room_type
        ),
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== '') {
      query = query.eq('status', status as any);
    }

    // Apply date range filter
    const now = new Date();
    let filterStartDate: Date | null = null;
    let filterEndDate: Date | null = null;

    if (startDate && endDate) {
      // Custom date range
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    } else if (dateRange) {
      // Predefined date ranges
      switch (dateRange) {
        case 'today':
          filterStartDate = new Date(now.setHours(0, 0, 0, 0));
          filterEndDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'week':
          filterStartDate = new Date(now);
          filterStartDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          filterStartDate.setHours(0, 0, 0, 0);
          filterEndDate = new Date();
          break;
        case 'month':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filterEndDate = new Date();
          break;
        case 'all':
        default:
          // No date filter
          break;
      }
    }

    // Apply date filters to query
    if (filterStartDate) {
      query = query.gte('created_at', filterStartDate.toISOString());
    }
    if (filterEndDate) {
      query = query.lte('created_at', filterEndDate.toISOString());
    }

    // Execute query
    const { data: bookings, error: queryError } = await query;

    if (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Transform data for CSV export
    const transformedData = (bookings || []).map((booking: any) => {
      const room = Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms;
      const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;

      // Calculate nights
      const checkIn = new Date(booking.check_in_date);
      const checkOut = new Date(booking.check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: booking.id,
        guest_name: profile?.full_name || 'N/A',
        guest_email: profile?.email || 'N/A',
        guest_phone: profile?.phone || 'N/A',
        room_number: room?.room_number || 'N/A',
        room_type: room?.room_type || 'N/A',
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        nights,
        number_of_guests: booking.number_of_guests,
        status: booking.status,
        payment_status: booking.payment_status,
        total_price: booking.total_price,
        currency: booking.currency,
        created_at: booking.created_at,
      };
    });

    // Convert to CSV
    const csv = convertToCSV(transformedData);

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bookings-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export bookings' },
      { status: 500 }
    );
  }
}
