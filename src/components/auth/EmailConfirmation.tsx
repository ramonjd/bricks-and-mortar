'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function EmailConfirmation() {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('auth');

	useEffect(() => {
		const handleEmailConfirmation = async () => {
			try {
				// Get the URL fragment parameters
				const hash = window.location.hash;
				if (!hash) {
					setStatus('error');
					setErrorMessage(t('invalidConfirmationLink'));
					return;
				}

				// Extract token_hash and type from the URL
				const hashParams = new URLSearchParams(hash.substring(1));
				const tokenHash = hashParams.get('token_hash');
				const type = hashParams.get('type');

				if (tokenHash && type === 'signup') {
					// Verify the email confirmation
					const { error } = await supabase.auth.verifyOtp({
						token_hash: tokenHash,
						type: 'signup',
					});

					if (error) {
						throw error;
					}

					setStatus('success');
				} else {
					setStatus('error');
					setErrorMessage(t('invalidConfirmationLink'));
				}
			} catch (error) {
				console.error('Email confirmation error:', error);
				setStatus('error');
				setErrorMessage(t('errorConfirmingEmail'));
			}
		};

		handleEmailConfirmation();
	}, [t]);

	if (status === 'loading') {
		return (
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
				<p className="text-gray-600">{t('pleaseWait')}</p>
			</div>
		);
	}

	if (status === 'success') {
		return (
			<div className="text-center">
				<div className="mb-4 text-green-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-16 w-16 mx-auto"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>
				<h3 className="mb-4 text-lg font-medium text-gray-900">{t('emailConfirmed')}</h3>
				<p className="text-gray-600 mb-6">{t('loginToYourAccount')}</p>
				<Button onClick={() => router.push(`/${locale}/login`)}>{t('login')}</Button>
			</div>
		);
	}

	return (
		<div className="text-center">
			<div className="mb-4 text-red-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-16 w-16 mx-auto"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</div>
			<h3 className="mb-4 text-lg font-medium text-gray-900">{t('confirmationFailed')}</h3>
			<p className="text-gray-600 mb-6">{errorMessage}</p>
			<Button onClick={() => router.push(`/${locale}/login`)}>{t('backToLogin')}</Button>
		</div>
	);
}
