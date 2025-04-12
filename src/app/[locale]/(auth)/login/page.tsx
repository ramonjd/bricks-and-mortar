import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function LoginPage({
	params: { locale },
	searchParams,
}: {
	params: { locale: string };
	searchParams: { error?: string; message?: string };
}) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout title={t('login')} subtitle={t('loginSubtitle')}>
			{searchParams.error === 'verification_expired' && (
				<div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
					<h3 className="text-sm font-medium text-yellow-800">
						{t('verificationExpired')}
					</h3>
					<p className="mt-2 text-sm text-yellow-700">
						{t('verificationExpiredDescription')}
					</p>
				</div>
			)}
			{searchParams.message === 'email_verified' && (
				<>
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
					<h3 className="mb-4 text-lg font-medium text-gray-900">
						{t('emailConfirmed')}
					</h3>
				</>
			)}
			<LoginForm />
		</AuthLayout>
	);
}
