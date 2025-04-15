'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginFormFields() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			if (data.session) {
				// Use a hard navigation to ensure the session is properly set
				window.location.href = `/${locale}/dashboard`;
			} else {
				setError(t('loginError'));
			}
		} catch (error) {
			console.error('Error logging in:', error);
			setError(t('loginError'));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

			<div className="space-y-2">
				<Label htmlFor="email">
					{t('emailAddress')}
				</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder={t('enterEmail')}
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="password">
					{t('password')}
				</Label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder={t('enterPassword')}
					required
					disabled={isLoading}
				/>
			</div>
			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? t('loggingIn') : t('login')}
			</Button>
			<div className="text-sm">
				<Link
					href="/forgot-password"
					className="font-semibold text-primary hover:text-primary/80"
				>
					{t('forgotPassword')}
				</Link>
			</div>
			<div className="text-sm">
				{t('noAccount')}{' '}
				<Link
					href={`/${locale}/register`}
					className="font-semibold text-primary hover:text-primary/80"
				>
					{t('createAccount')}
				</Link>
			</div>
		</form>
	);
}
