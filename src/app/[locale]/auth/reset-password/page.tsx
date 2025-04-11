import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export default function ResetPasswordPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations('auth');

	return (
		<AuthLayout
			title={t('resetPassword')}
			subtitle={t('resetPasswordSubtitle')}
		>
			<ResetPasswordForm />
		</AuthLayout>
	);
}