'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/lib/services/auth';

export default function LoginFormFields() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		try {
			await signIn({ email, password });
			router.push(`/${locale}/dashboard`);
			router.refresh();
		} catch (error) {
			console.error('Error logging in:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					{t('emailAddress')}
				</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder={t('enterEmail')}
					required
					disabled={isLoading}
					className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>
			<div className="space-y-2">
				<label htmlFor="password" className="block text-sm font-medium text-gray-700">
					{t('password')}
				</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder={t('enterPassword')}
					required
					disabled={isLoading}
					className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
				/>
			</div>
			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? t('loggingIn') : t('login')}
			</Button>
		</form>
	);
} 