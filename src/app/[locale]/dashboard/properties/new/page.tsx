import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PrefilledPropertyWrapper from '@/components/properties/PrefilledPropertyWrapper';

export default async function NewPropertyPage({
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

	const t = await getTranslations('properties');

	return (
		<div className="container mx-auto px-4 py-8 sm:px-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{t('new.title')}</h1>
				<p className="text-muted-foreground">{t('new.description')}</p>
			</div>
			<div className="bg-white shadow rounded-lg p-6">
				<PrefilledPropertyWrapper userId={user.id} locale={locale} />
			</div>
		</div>
	);
}
