import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Check that the page loaded successfully
    await expect(page).toHaveTitle(/Hotelius/);
  });

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/');

    // Check for main navigation or header elements
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Basic accessibility check - main landmark should exist
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Hotel Search', () => {
  test('should display search widget', async ({ page }) => {
    await page.goto('/');

    // Look for date inputs or search functionality
    const searchForm = page.locator('form').first();
    await expect(searchForm).toBeVisible();
  });
});
