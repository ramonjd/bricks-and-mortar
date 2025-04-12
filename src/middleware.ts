import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from '@/lib/i18n/config';

export async function middleware(request: NextRequest) {
	console.error('[Middleware] Request URL:', request.nextUrl.toString());

	// Check if the request is for the confirm-email page
	if (request.nextUrl.pathname.includes('/confirm-email')) {
		console.error('[Middleware] Handling confirm-email request');
		// For confirm-email, we want to let the route handler handle it
		return NextResponse.next();
	}

	// Create a response object
	const response = NextResponse.next();

	// Create a Supabase client with the response
	const supabase = createMiddlewareClient({ req: request, res: response });

	// Get the user's session
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Handle locale
	const pathname = request.nextUrl.pathname;
	const pathnameIsMissingLocale = locales.every(
		(locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
	);

	// Redirect if there is no locale
	if (pathnameIsMissingLocale) {
		console.error(
			'[Middleware] Missing locale, redirecting to:',
			`/${defaultLocale}${pathname}`
		);
		// e.g. incoming request is /products
		// The new URL is now /en/products
		return NextResponse.redirect(
			new URL(
				`/${defaultLocale}${pathname.startsWith('/') ? '' : ''}${pathname}`,
				request.url
			)
		);
	}

	return response;
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
