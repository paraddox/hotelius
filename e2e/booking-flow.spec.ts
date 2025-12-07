import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.describe('Hotel Page', () => {
    test('should display hotel information', async ({ page }) => {
      await page.goto('/en/hotels/test-hotel');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check that hotel info is displayed
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    });

    test('should display available rooms', async ({ page }) => {
      await page.goto('/en/hotels/test-hotel');

      await page.waitForLoadState('networkidle');

      // Look for room cards or room list
      const roomSection = page.locator('[class*="room"]').first();
      await expect(roomSection).toBeVisible();
    });
  });

  test.describe('Room Selection', () => {
    test('should navigate to rooms page', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 3);

      const checkIn = tomorrow.toISOString().split('T')[0];
      const checkOut = dayAfter.toISOString().split('T')[0];

      await page.goto(`/en/hotels/test-hotel/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=2`);

      await page.waitForLoadState('networkidle');

      // Should display available rooms
      const pageTitle = page.getByRole('heading', { level: 1 });
      await expect(pageTitle).toBeVisible();
    });
  });

  test.describe('Guest Details', () => {
    test('should display guest form on booking page', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 3);

      const checkIn = tomorrow.toISOString().split('T')[0];
      const checkOut = dayAfter.toISOString().split('T')[0];

      await page.goto(`/en/hotels/test-hotel/book?roomId=1&checkIn=${checkIn}&checkOut=${checkOut}&guests=2`);

      await page.waitForLoadState('networkidle');

      // Should have a form for guest details
      const form = page.locator('form').first();
      await expect(form).toBeVisible();
    });
  });
});

test.describe('Confirmation Page', () => {
  test('should display confirmation on success', async ({ page }) => {
    await page.goto('/en/hotels/test-hotel/book/confirmation?bookingId=test-123');

    await page.waitForLoadState('networkidle');

    // Should show success message or confirmation
    const heading = page.getByRole('heading');
    await expect(heading.first()).toBeVisible();
  });
});
