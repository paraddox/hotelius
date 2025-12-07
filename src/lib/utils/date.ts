/**
 * Date utility functions for the booking engine
 */

/**
 * Format a date according to locale
 * @param date - Date to format
 * @param locale - Locale string (default: 'en')
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, options);
}

/**
 * Format a currency amount from cents
 * @param amountCents - Amount in cents
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 */
export function formatCurrency(
  amountCents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate the number of nights between two dates
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
  const diffDays = Math.round(Math.abs((checkOut.getTime() - checkIn.getTime()) / oneDay));
  return diffDays;
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add (can be negative)
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date is within a range (inclusive)
 * @param date - Date to check
 * @param rangeStart - Start of range
 * @param rangeEnd - End of range
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const time = date.getTime();
  return time >= rangeStart.getTime() && time <= rangeEnd.getTime();
}

/**
 * Get today's date at midnight
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get tomorrow's date at midnight
 */
export function getTomorrow(): Date {
  return addDays(getToday(), 1);
}

/**
 * Format a date range for display
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @param locale - Locale string
 */
export function formatDateRange(
  checkIn: Date | string,
  checkOut: Date | string,
  locale: string = 'en'
): string {
  const checkInFormatted = formatDate(checkIn, locale);
  const checkOutFormatted = formatDate(checkOut, locale);
  return `${checkInFormatted} - ${checkOutFormatted}`;
}

/**
 * Parse a date string (YYYY-MM-DD) to Date object
 * @param dateString - Date string in YYYY-MM-DD format
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date to YYYY-MM-DD string
 * @param date - Date to format
 */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 */
export function isPast(date: Date): boolean {
  const today = getToday();
  return date.getTime() < today.getTime();
}

/**
 * Check if a date is today
 * @param date - Date to check
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, getToday());
}

/**
 * Get the day of week name
 * @param date - Date to get day name for
 * @param locale - Locale string
 * @param format - 'long', 'short', or 'narrow'
 */
export function getDayName(
  date: Date,
  locale: string = 'en',
  format: 'long' | 'short' | 'narrow' = 'long'
): string {
  return date.toLocaleDateString(locale, { weekday: format });
}

/**
 * Get the month name
 * @param date - Date to get month name for
 * @param locale - Locale string
 * @param format - 'long', 'short', or 'narrow'
 */
export function getMonthName(
  date: Date,
  locale: string = 'en',
  format: 'long' | 'short' | 'narrow' = 'long'
): string {
  return date.toLocaleDateString(locale, { month: format });
}
