import { test, expect } from '@playwright/test';

test('language switcher changes the route and language', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');

  // Check we're on the English version by default
  await expect(page).toHaveURL('/en');

  // Find the language switcher and switch to German
  const languageSwitcher = page.locator('select');
  await expect(languageSwitcher).toBeVisible();
  await expect(languageSwitcher).toHaveValue('en');

  // Change language to German
  await languageSwitcher.selectOption('de');

  // Wait for the navigation to complete and check the URL
  await page.waitForURL('/de');
  await expect(page).toHaveURL('/de');

  // Verify the language switcher shows German selected
  await expect(languageSwitcher).toHaveValue('de');

  // Switch back to English
  await languageSwitcher.selectOption('en');

  // Wait for the navigation to complete and check the URL
  await page.waitForURL('/en');
  await expect(page).toHaveURL('/en');
  await expect(languageSwitcher).toHaveValue('en');
});
