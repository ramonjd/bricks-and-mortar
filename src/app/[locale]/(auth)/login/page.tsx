import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import LoginForm from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout title={t('login')} subtitle={t('loginSubtitle')}>
			<LoginForm />
		</AuthLayout>
	);
}
