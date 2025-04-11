import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/lib/services/auth';

export function ForgotPasswordForm() {
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
			<div className="text-center">
				<h3 className="mb-4 text-lg font-medium text-gray-900">{t('checkYourEmail')}</h3>
				<p className="text-gray-600 mb-6">{t('resetEmailSent')}</p>
				<Button onClick={() => router.push(`/${locale}/auth/login`)}>
					{t('backToLogin')}
				</Button>
			</div>
		);
	}

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && (
				<div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>
			)}

			<div>
				<p className="text-sm text-gray-600 mb-4">{t('forgotPasswordDescription')}</p>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					{t('emailAddress')}
				</label>
				<div className="mt-1">
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<Button 
					type="submit" 
					className="w-full"
					disabled={isLoading}
				>
					{isLoading ? t('sending') : t('resetPassword')}
				</Button>
			</div>
		</form>
	);
}