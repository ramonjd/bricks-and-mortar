'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { updatePassword } from '@/lib/services/auth';

export default function ResetPasswordFormFields() {
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
			await updatePassword(password);
			setIsSuccess(true);
		} catch (err) {
			console.error('Password update error:', err);
			setError(t('updatePasswordError'));
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>{t('passwordUpdated')}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">{t('passwordUpdatedDescription')}</p>
				</CardContent>
				<CardFooter>
					<Button onClick={() => router.push(`/${locale}/dashboard`)}>
						{t('continueToDashboard')}
					</Button>
				</CardFooter>
			</Card>
		);
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>}

			<div className="space-y-2">
				<Label htmlFor="password">{t('newPassword')}</Label>
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

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? t('updating') : t('updatePassword')}
			</Button>
		</form>
	);
}
