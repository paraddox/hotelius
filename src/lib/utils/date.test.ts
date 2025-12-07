import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatCurrency,
  calculateNights,
  addDays,
  isDateInRange
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
});
