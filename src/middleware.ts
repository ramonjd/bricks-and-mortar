import createMiddleware from 'next-intl/middleware';
import { defaultLocale, locales } from '@/lib/i18n/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const publicPages = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

const intlMiddleware = createMiddleware({
	// A list of all locales that are supported
	locales,

	// If this locale is matched, pathnames work without a prefix (e.g. `/about`)
	defaultLocale,

	// Always use locale prefix in the URL
	localePrefix: 'always',

	// Disable automatic locale detection
	localeDetection: false,
});

export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	
	// Apply internationalization middleware
	const response = intlMiddleware(request);
	
	// Create Supabase middleware client
	const supabase = createMiddlewareClient({ req: request, res: response });
	
	// Refresh session if expired
	const { data: { session } } = await supabase.auth.getSession();
	
	// Get the locale from the path
	const locale = request.nextUrl.pathname.split('/')[1];
	
	// Check if the path is prefixed with a locale
	const isPathWithLocale = locales.some(loc => pathname.startsWith(`/${loc}/`));
	const hasLocale = locales.includes(locale) && isPathWithLocale;
	
	// For authentication checks, we need to consider paths with locale prefixes
	const isPublicPage = hasLocale && publicPages.some(page => pathname.endsWith(page));
	const isAuthPage = hasLocale && pathname.includes('/auth/');
	
	// If logged in and on an auth page, redirect to dashboard
	if (session && isAuthPage) {
		return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
	}
	
	// If not logged in and not on a public page, redirect to login
	if (!session && !isPublicPage && hasLocale && !pathname.endsWith(`/${locale}`)) {
		return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
	}
	
	return response;
}

export const config = {
	// Skip all paths that should not be internationalized
	matcher: ['/((?!api|_next|.*\\..*).*)'],
};
