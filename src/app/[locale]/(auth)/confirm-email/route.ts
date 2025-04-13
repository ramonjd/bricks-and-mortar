import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { locales, type Locale } from '@/lib/i18n/config';

export async function GET(request: Request) {
	console.error('[Route Handler] Starting confirm-email handler');
	const requestUrl = new URL(request.url);

	// Extract locale from the URL path
	const pathSegments = requestUrl.pathname.split('/').filter(Boolean);
	const locale = pathSegments[0] as Locale;

	// Validate locale
	const isValidLocale = locales.includes(locale);
	if (!isValidLocale) {
		console.error('[Route Handler] Invalid locale:', locale);
		return NextResponse.redirect(`${requestUrl.origin}/en/login?error=invalid_locale`);
	}

	console.error('[Route Handler] Using locale:', locale);

	const code = requestUrl.searchParams.get('code');
	const token_hash = requestUrl.searchParams.get('token_hash');
	const type = requestUrl.searchParams.get('type');
	const next = requestUrl.searchParams.get('next');

	console.error('[Route Handler] URL params:', {
		code,
		token_hash,
		type,
		next,
	});

	// If we have a code, exchange it for a session
	if (code) {
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

		try {
			const { error } = await supabase.auth.exchangeCodeForSession(code);
			if (error) {
				console.error('[Route Handler] Code exchange error:', error);
				return NextResponse.redirect(
					`${requestUrl.origin}/${locale}/login?error=verification_failed`
				);
			}
		} catch (error) {
			console.error('[Route Handler] Unexpected error during code exchange:', error);
			return NextResponse.redirect(
				`${requestUrl.origin}/${locale}/login?error=verification_failed`
			);
		}
	}

	// If we have a token_hash, we need to verify the email
	if (token_hash && type === 'email') {
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

		try {
			const { error } = await supabase.auth.verifyOtp({
				token_hash,
				type: 'email',
			});

			if (error) {
				console.error('[Route Handler] Token verification error:', error);
				return NextResponse.redirect(
					`${requestUrl.origin}/${locale}/login?error=verification_failed`
				);
			}
		} catch (error) {
			console.error('[Route Handler] Unexpected error during token verification:', error);
			return NextResponse.redirect(
				`${requestUrl.origin}/${locale}/login?error=verification_failed`
			);
		}
	}

	// If we get here, verification was successful
	return NextResponse.redirect(`${requestUrl.origin}/${locale}/login?message=email_verified`);
}
