import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout title={t('forgotPassword')} subtitle={t('forgotPasswordSubtitle')}>
			<ForgotPasswordForm />
			<div className="text-center mt-6">
				<p className="text-sm text-gray-600">
					<Link
						href={`/${locale}/login`}
						className="text-blue-600 hover:underline font-medium"
					>
						{t('backToLogin')}
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}
