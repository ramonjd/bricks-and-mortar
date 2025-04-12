'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { supabase } from '@/lib/supabase/client';

export default function ConfirmEmailPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');
	const router = useRouter();
	const searchParams = useSearchParams();
	const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const confirmEmail = async () => {
			try {
				// Get token and type from the URL
				const token = searchParams.get('token');
				const type = searchParams.get('type');

				if (!token || type !== 'signup') {
					setConfirmationStatus('error');
					setErrorMessage(t('invalidConfirmationLink'));
					return;
				}

				// Verify the email confirmation token
				const { error } = await supabase.auth.verifyOtp({
					token_hash: token,
					type: 'signup',
				});

				if (error) {
					console.error('Error confirming email:', error);
					setConfirmationStatus('error');
					setErrorMessage(error.message || t('errorConfirmingEmail'));
					return;
				}

				setConfirmationStatus('success');
			} catch (error) {
				console.error('Error during email confirmation:', error);
				setConfirmationStatus('error');
				setErrorMessage(t('errorConfirmingEmail'));
			}
		};

		confirmEmail();
	}, [searchParams, t]);

	return (
		<AuthLayout
			title={
				confirmationStatus === 'loading'
					? t('confirmingEmail')
					: confirmationStatus === 'success'
						? t('emailConfirmed')
						: t('confirmationFailed')
			}
			subtitle={
				confirmationStatus === 'loading'
					? t('pleaseWait')
					: confirmationStatus === 'success'
						? t('loginToYourAccount')
						: errorMessage
			}
		>
			{confirmationStatus === 'success' ? (
				<div className="space-y-6">
					<div className="p-4 bg-green-50 rounded-md text-green-800 text-center">
						{t('accountActivated')}
					</div>
					<LoginForm />
				</div>
			) : confirmationStatus === 'error' ? (
				<div className="space-y-6">
					<div className="p-4 bg-red-50 rounded-md text-red-800 text-center">
						{errorMessage}
					</div>
					<button
						onClick={() => router.push(`/${locale}/register`)}
						className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						{t('tryAgain')}
					</button>
				</div>
			) : (
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
				</div>
			)}
		</AuthLayout>
	);
}
