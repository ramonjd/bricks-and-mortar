import { supabase } from '@/lib/supabase/client';
import { User, AuthResponse as SupabaseAuthResponse } from '@supabase/supabase-js';

export type AuthFormData = {
	email: string;
	password: string;
	locale: string;
};

export type AuthResponse = {
	data: { user: User | null; session: SupabaseAuthResponse['data']['session'] } | null;
	error: {
		message: string;
		code?: string;
	} | null;
};

export async function signUp({ email, password, locale }: AuthFormData): Promise<AuthResponse> {
	// Get the current URL origin
	const origin = window.location.origin;

	// Create the redirect URL
	const redirectUrl = `${origin}/${locale}/confirm-email`;

	console.error('[SignUp] Redirect URL:', redirectUrl);

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: redirectUrl,
			data: {
				locale,
			},
		},
	});

	if (error) {
		return {
			data: null,
			error: {
				message: error.message,
				code: error.status?.toString() || error.code,
			},
		};
	}

	return { data, error: null };
}

export async function signIn({ email, password }: AuthFormData): Promise<AuthResponse> {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		return {
			data: null,
			error: {
				message: error.message,
				code: error.status?.toString() || error.code,
			},
		};
	}

	return { data, error: null };
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		throw error;
	}
}

export async function resetPassword(email: string) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/reset-password`,
	});

	if (error) {
		throw error;
	}
}

export async function updatePassword(password: string) {
	const { error } = await supabase.auth.updateUser({
		password,
	});

	if (error) {
		throw error;
	}
}

export async function getCurrentUser(): Promise<User | null> {
	const { data, error } = await supabase.auth.getUser();
	if (error || !data?.user) {
		return null;
	}
	return data.user;
}
