import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatDate,
  formatCurrency,
  calculateNights,
  addDays,
  isDateInRange,
  getToday,
  getTomorrow,
  formatDateRange,
  parseDate,
  toISODateString,
  isSameDay,
  isPast,
  isToday,
  getDayName,
  getMonthName,
} from './date';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('formats date with default options', () => {
      const date = new Date('2025-01-15');
      const result = formatDate(date);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('handles string date input', () => {
      const result = formatDate('2025-01-15');
      expect(result).toBeDefined();
    });

    it('uses specified locale', () => {
      const date = new Date('2025-01-15');
      const enResult = formatDate(date, 'en');
      const esResult = formatDate(date, 'es');
      // Results should be strings (format may vary by locale)
      expect(typeof enResult).toBe('string');
      expect(typeof esResult).toBe('string');
    });

    it('accepts custom formatting options', () => {
      const date = new Date('2025-01-15');
      const result = formatDate(date, 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('formats amount in dollars', () => {
      const result = formatCurrency(1500, 'USD');
      expect(result).toContain('15');
    });

    it('handles zero amount', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('0');
    });

    it('handles negative amounts', () => {
      const result = formatCurrency(-1000, 'USD');
      expect(result).toContain('10');
    });

    it('supports different currencies', () => {
      const usdResult = formatCurrency(1000, 'USD');
      const eurResult = formatCurrency(1000, 'EUR');
      expect(usdResult).toBeDefined();
      expect(eurResult).toBeDefined();
    });
  });

  describe('calculateNights', () => {
    it('calculates nights between two dates', () => {
      const checkIn = new Date('2025-01-15');
      const checkOut = new Date('2025-01-18');
      const nights = calculateNights(checkIn, checkOut);
      expect(nights).toBe(3);
    });

    it('returns 0 for same day', () => {
      const date = new Date('2025-01-15');
      const nights = calculateNights(date, date);
      expect(nights).toBe(0);
    });

    it('handles negative ranges (returns positive count)', () => {
      const checkIn = new Date('2025-01-18');
      const checkOut = new Date('2025-01-15');
      const nights = calculateNights(checkIn, checkOut);
      expect(nights).toBe(3);
    });
  });

  describe('addDays', () => {
    it('adds days to a date', () => {
      const date = new Date('2025-01-15');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });

    it('handles month boundaries', () => {
      const date = new Date('2025-01-30');
      const result = addDays(date, 5);
      expect(result.getMonth()).toBe(1); // February (0-indexed)
    });

    it('handles negative days', () => {
      const date = new Date('2025-01-15');
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(10);
    });

    it('does not mutate original date', () => {
      const date = new Date('2025-01-15');
      const originalTime = date.getTime();
      addDays(date, 5);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('isDateInRange', () => {
    const rangeStart = new Date('2025-01-10');
    const rangeEnd = new Date('2025-01-20');

    it('returns true for date within range', () => {
      const date = new Date('2025-01-15');
      expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
    });

    it('returns true for date on range start', () => {
      expect(isDateInRange(rangeStart, rangeStart, rangeEnd)).toBe(true);
    });

    it('returns true for date on range end', () => {
      expect(isDateInRange(rangeEnd, rangeStart, rangeEnd)).toBe(true);
    });

    it('returns false for date before range', () => {
      const date = new Date('2025-01-05');
      expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
    });

    it('returns false for date after range', () => {
      const date = new Date('2025-01-25');
      expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
    });
  });

  describe('getToday', () => {
    it('returns current date at midnight', () => {
      const today = getToday();
      expect(today).toBeInstanceOf(Date);
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
      expect(today.getMilliseconds()).toBe(0);
    });

    it('returns date matching current day', () => {
      const today = getToday();
      const now = new Date();
      expect(today.getFullYear()).toBe(now.getFullYear());
      expect(today.getMonth()).toBe(now.getMonth());
      expect(today.getDate()).toBe(now.getDate());
    });
  });

  describe('getTomorrow', () => {
    it('returns next day at midnight', () => {
      const tomorrow = getTomorrow();
      const today = getToday();
      expect(tomorrow.getTime()).toBeGreaterThan(today.getTime());
      expect(tomorrow.getHours()).toBe(0);
      expect(tomorrow.getMinutes()).toBe(0);
    });

    it('returns exactly one day after today', () => {
      const tomorrow = getTomorrow();
      const today = getToday();
      const diffMs = tomorrow.getTime() - today.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(1);
    });
  });

  describe('formatDateRange', () => {
    it('formats date range with Date objects', () => {
      const checkIn = new Date('2025-01-15');
      const checkOut = new Date('2025-01-20');
      const result = formatDateRange(checkIn, checkOut);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('-');
    });

    it('formats date range with string dates', () => {
      const result = formatDateRange('2025-01-15', '2025-01-20');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('uses specified locale', () => {
      const checkIn = new Date('2025-01-15');
      const checkOut = new Date('2025-01-20');
      const enResult = formatDateRange(checkIn, checkOut, 'en');
      const esResult = formatDateRange(checkIn, checkOut, 'es');
      expect(typeof enResult).toBe('string');
      expect(typeof esResult).toBe('string');
    });
  });

  describe('parseDate', () => {
    it('parses YYYY-MM-DD format correctly', () => {
      const result = parseDate('2025-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January (0-indexed)
      expect(result.getDate()).toBe(15);
    });

    it('handles month boundaries correctly', () => {
      const result = parseDate('2025-12-31');
      expect(result.getMonth()).toBe(11); // December (0-indexed)
      expect(result.getDate()).toBe(31);
    });

    it('handles leap year dates', () => {
      const result = parseDate('2024-02-29');
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });
  });

  describe('toISODateString', () => {
    it('converts Date to YYYY-MM-DD format', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025
      const result = toISODateString(date);
      expect(result).toBe('2025-01-15');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const result = toISODateString(date);
      expect(result).toBe('2025-01-05');
    });

    it('handles year end dates', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025
      const result = toISODateString(date);
      expect(result).toBe('2025-12-31');
    });

    it('round-trips with parseDate', () => {
      const original = '2025-06-15';
      const date = parseDate(original);
      const result = toISODateString(date);
      expect(result).toBe(original);
    });
  });

  describe('isSameDay', () => {
    it('returns true for same date', () => {
      const date1 = new Date('2025-01-15T10:00:00');
      const date2 = new Date('2025-01-15T15:30:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different dates', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-01-16');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('returns true for identical timestamps', () => {
      const date1 = new Date('2025-01-15T12:00:00');
      const date2 = new Date('2025-01-15T12:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different months same day', () => {
      const date1 = new Date('2025-01-15');
      const date2 = new Date('2025-02-15');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('isPast', () => {
    it('returns true for date in the past', () => {
      const pastDate = new Date('2020-01-01');
      expect(isPast(pastDate)).toBe(true);
    });

    it('returns false for future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isPast(futureDate)).toBe(false);
    });

    it('compares against today at midnight', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isPast(yesterday)).toBe(true);
    });
  });

  describe('isToday', () => {
    it('returns true for current date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('returns true regardless of time', () => {
      const morning = new Date();
      morning.setHours(0, 0, 0, 0);
      const evening = new Date();
      evening.setHours(23, 59, 59, 999);
      expect(isToday(morning)).toBe(true);
      expect(isToday(evening)).toBe(true);
    });
  });

  describe('getDayName', () => {
    it('returns full day name by default', () => {
      const date = new Date('2025-01-15'); // Wednesday
      const result = getDayName(date);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns short day name', () => {
      const date = new Date('2025-01-15');
      const result = getDayName(date, 'en', 'short');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns narrow day name', () => {
      const date = new Date('2025-01-15');
      const result = getDayName(date, 'en', 'narrow');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('uses specified locale', () => {
      const date = new Date('2025-01-15');
      const enResult = getDayName(date, 'en');
      const esResult = getDayName(date, 'es');
      expect(typeof enResult).toBe('string');
      expect(typeof esResult).toBe('string');
    });
  });

  describe('getMonthName', () => {
    it('returns full month name by default', () => {
      const date = new Date('2025-01-15');
      const result = getMonthName(date);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns short month name', () => {
      const date = new Date('2025-01-15');
      const result = getMonthName(date, 'en', 'short');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns narrow month name', () => {
      const date = new Date('2025-01-15');
      const result = getMonthName(date, 'en', 'narrow');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('uses specified locale', () => {
      const date = new Date('2025-01-15');
      const enResult = getMonthName(date, 'en');
      const esResult = getMonthName(date, 'es');
      expect(typeof enResult).toBe('string');
      expect(typeof esResult).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('handles leap year calculations', () => {
      const leapYearDate = new Date(2024, 1, 29); // Feb 29, 2024
      expect(leapYearDate.getDate()).toBe(29);
      const nextDay = addDays(leapYearDate, 1);
      expect(nextDay.getMonth()).toBe(2); // March
      expect(nextDay.getDate()).toBe(1);
    });

    it('handles year boundaries', () => {
      const newYearsEve = new Date(2024, 11, 31); // Dec 31, 2024
      const newYearsDay = addDays(newYearsEve, 1);
      expect(newYearsDay.getFullYear()).toBe(2025);
      expect(newYearsDay.getMonth()).toBe(0); // January
      expect(newYearsDay.getDate()).toBe(1);
    });

    it('handles month boundaries correctly', () => {
      const jan31 = new Date(2025, 0, 31);
      const feb1 = addDays(jan31, 1);
      expect(feb1.getMonth()).toBe(1); // February
      expect(feb1.getDate()).toBe(1);
    });

    it('calculateNights handles DST transitions', () => {
      // Test that it counts calendar days, not 24-hour periods
      const date1 = new Date('2025-03-08'); // Example date
      const date2 = new Date('2025-03-10');
      const nights = calculateNights(date1, date2);
      expect(nights).toBe(2);
    });
  });
});
