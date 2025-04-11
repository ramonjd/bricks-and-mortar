import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout title={t('login')} subtitle={t('loginSubtitle')}>
			<LoginForm />
			<div className="text-center mt-6">
				<p className="text-sm text-gray-600">
					{t('noAccount')}{' '}
					<Link
						href={`/${locale}/auth/register`}
						className="text-blue-600 hover:underline font-medium"
					>
						{t('createAccount')}
					</Link>
				</p>
				<p className="text-sm text-gray-600 mt-2">
					<Link
						href={`/${locale}/auth/forgot-password`}
						className="text-blue-600 hover:underline font-medium"
					>
						{t('forgotPassword')}
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}
