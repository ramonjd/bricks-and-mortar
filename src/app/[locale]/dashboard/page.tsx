import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StoredPropertiesAlertWrapper from '@/components/properties/StoredPropertiesAlertWrapper';

export default async function DashboardPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Check if user is authenticated
	if (!user) {
		redirect(`/${locale}/login`);
	}

	const t = await getTranslations();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Main content */}
			<main className="container mx-auto px-4 py-8 sm:px-6">
				<StoredPropertiesAlertWrapper locale={locale} />
				<div className="bg-white shadow rounded-lg p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						{t('dashboard.welcome')}
					</h2>
					<p className="text-gray-600">{t('dashboard.description')}</p>
					<Link
						href={`/${locale}/dashboard/properties/new`}
						className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						{t('properties.new.title')}
					</Link>
				</div>
			</main>
		</div>
	);
}
