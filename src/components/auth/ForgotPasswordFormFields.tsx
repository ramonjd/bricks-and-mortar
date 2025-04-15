'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { resetPassword } from '@/lib/services/auth';

export default function ForgotPasswordFormFields() {
	const [email, setEmail] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			await resetPassword(email);
			setIsSuccess(true);
		} catch (err) {
			console.error('Password reset error:', err);
			setError(t('resetPasswordError'));
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
					<p className="text-muted-foreground">{t('resetEmailSent')}</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => router.push(`/${locale}/(auth)/login`)}>
						{t('backToLogin')}
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

			<div className="space-y-4">
				<p className="text-sm text-muted-foreground">{t('forgotPasswordDescription')}</p>
				<div className="space-y-2">
					<Label htmlFor="email">
						{t('emailAddress')}
					</Label>
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
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? t('sending') : t('resetPassword')}
			</Button>
		</form>
	);
}
