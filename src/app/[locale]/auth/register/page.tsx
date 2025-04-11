import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout
			title={t('createAccount')}
			subtitle={t('createAccountSubtitle')}
		>
			<RegisterForm />
			<div className="text-center mt-6">
				<p className="text-sm text-gray-600">
					{t('alreadyHaveAccount')}{' '}
					<Link href={`/${locale}/auth/login`} className="text-blue-600 hover:underline font-medium">
						{t('login')}
					</Link>
				</p>
			</div>
		</AuthLayout>
	);
}