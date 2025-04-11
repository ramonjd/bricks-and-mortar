import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, Locale, locales } from '@/lib/i18n/config';
import { CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
	const response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: CookieOptions) {
					response.cookies.set({
						name,
						value,
						...options,
					});
				},
				remove(name: string, options: CookieOptions) {
					response.cookies.set({
						name,
						value: '',
						...options,
					});
				},
			},
		}
	);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Get the pathname of the request (e.g. /, /protected)
	const pathname = request.nextUrl.pathname;

	// Get the locale from the path
	const locale = pathname.split('/')[1];
	const isLocaleValid = locales.includes(locale as Locale);

	// If the pathname doesn't start with a locale, redirect to the default locale
	if (!isLocaleValid) {
		return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
	}

	// Auth condition
	const isAuthPage = pathname.includes('/auth/');
	const isProtectedPage = pathname.includes('/dashboard');

	if (session) {
		// If the user is signed in and the current path is /auth/* redirect the user to /dashboard
		if (isAuthPage) {
			return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
		}
	} else {
		// If the user is not signed in and the current path is /dashboard redirect the user to /auth/login
		if (isProtectedPage) {
			return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
		}
	}

	return response;
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
