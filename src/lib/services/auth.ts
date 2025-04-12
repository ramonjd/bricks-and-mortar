import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export type AuthFormData = {
	email: string;
	password: string;
	locale: string;
};

export async function signUp({ email, password, locale }: AuthFormData) {
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
		throw error;
	}

	return data;
}

export async function signIn({ email, password }: AuthFormData) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw error;
	}

	return data;
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
