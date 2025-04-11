import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow">
				<div className="container mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
					<h1 className="text-xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
					<LogoutButton />
				</div>
			</header>

			{/* Main content */}
			<main className="container mx-auto px-4 py-8 sm:px-6">
				<div className="bg-white shadow rounded-lg p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">{t('dashboard.welcome')}</h2>
					<p className="text-gray-600">{t('dashboard.description')}</p>
				</div>
			</main>
		</div>
	);
}