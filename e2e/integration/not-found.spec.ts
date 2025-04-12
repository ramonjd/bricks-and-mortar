import { test, expect } from '@playwright/test';

test.describe('Custom 404 Page', () => {
	test('displays custom 404 page for non-existent routes in English', async ({ page }) => {
		// Navigate to a non-existent route in English
		await page.goto('/en/non-existent-page');

		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Check that we're on the 404 page
		await expect(page).toHaveURL('/en/non-existent-page');

		// Verify the 404 page content
		await expect(page.locator('h1')).toHaveText('404');
		await expect(page.locator('h2')).toContainText('Page Not Found');
		await expect(page.locator('p')).toContainText(
			'The page you are looking for does not exist or has been moved'
		);

		// Use a more flexible approach to find the link
		const backToHomeLink = page.locator('a').filter({ hasText: 'Back to Home' });
		await expect(backToHomeLink).toBeVisible();
		await expect(backToHomeLink).toHaveAttribute('href', '/en');
	});

	test('displays custom 404 page for non-existent routes in German', async ({ page }) => {
		// Navigate to a non-existent route in German
		await page.goto('/de/non-existent-page');

		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Check that we're on the 404 page
		await expect(page).toHaveURL('/de/non-existent-page');

		// Verify the 404 page content in German
		await expect(page.locator('h1')).toHaveText('404');
		await expect(page.locator('h2')).toContainText('Seite nicht gefunden');
		await expect(page.locator('p')).toContainText(
			'Die gesuchte Seite existiert nicht oder wurde verschoben'
		);

		// Use a more flexible approach to find the link
		const backToHomeLink = page.locator('a').filter({ hasText: 'Zurück zur Startseite' });
		await expect(backToHomeLink).toBeVisible();
		await expect(backToHomeLink).toHaveAttribute('href', '/de');
	});

	test('redirects non-localized routes to default locale and shows 404 page', async ({
		page,
	}) => {
		// Navigate to a non-existent route without locale
		await page.goto('/non-existent-page');

		// Wait for the page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Check that we're redirected to the default locale (English) and see the 404 page
		await expect(page).toHaveURL('/en/non-existent-page');

		// Verify the 404 page content
		await expect(page.locator('h1')).toHaveText('404');
		await expect(page.locator('h2')).toContainText('Page Not Found');
	});
});
