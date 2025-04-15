'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { signUp } from '@/lib/services/auth';

export default function RegisterFormFields() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Check if passwords match
		if (password !== confirmPassword) {
			setError(t('passwordsDoNotMatch'));
			return;
		}

		// Check password strength
		if (password.length < 8) {
			setError(t('passwordTooShort'));
			return;
		}

		setIsLoading(true);

		try {
			const { data, error: signUpError } = await signUp({ email, password, locale });

			if (signUpError) {
				// Handle specific error cases
				if (
					signUpError.code === '23505' ||
					signUpError.message.includes('already registered')
				) {
					setError(t('emailAlreadyRegistered'));
				} else if (signUpError.message.includes('password')) {
					setError(t('invalidPassword'));
				} else if (signUpError.message.includes('email')) {
					setError(t('invalidEmail'));
				} else {
					// Fallback to generic error message
					setError(signUpError.message || t('registrationError'));
				}
				return;
			}

			// If we have a session, the user was auto-confirmed
			if (data?.session) {
				router.push(`/${locale}/dashboard`);
				router.refresh();
			} else {
				// No session means email confirmation is required
				setIsSuccess(true);
			}
		} catch (err) {
			console.error('Registration error:', err);
			setError(t('registrationError'));
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('checkYourEmail')}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{t('emailConfirmationSent')}</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => router.push(`/${locale}/login`)}>
						{t('backToLogin')}
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

			<div className="space-y-2">
				<Label htmlFor="email">{t('emailAddress')}</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">{t('password')}</Label>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					required
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				/>
			</div>

			<Button type="submit" disabled={isLoading} className="w-full">
				{isLoading ? t('registering') : t('register')}
			</Button>
		</form>
	);
}
