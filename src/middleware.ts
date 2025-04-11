import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from '@/lib/i18n/config';

export default createMiddleware({
	// A list of all locales that are supported
	locales,

	// If this locale is matched, pathnames work without a prefix (e.g. `/about`)
	defaultLocale,

	// Always use locale prefix in the URL
	localePrefix: 'always',

	// Disable automatic locale detection
	localeDetection: false,
});

export const config = {
	// Skip all paths that should not be internationalized
	matcher: ['/((?!api|_next|.*\\..*).*)'],
};
