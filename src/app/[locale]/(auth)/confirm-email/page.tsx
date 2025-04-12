import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { AuthLayout } from '@/components/auth/AuthLayout';
import EmailConfirmation from '@/components/auth/EmailConfirmation';

export default function ConfirmEmailPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout title={t('confirmingEmail')} subtitle={t('pleaseWait')}>
			<EmailConfirmation />
		</AuthLayout>
	);
}
