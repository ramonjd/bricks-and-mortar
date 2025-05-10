import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditPropertyForm from '@/components/properties/EditPropertyForm';

export default async function EditPropertyPage({
	params: { locale, id },
}: {
	params: { locale: string; id: string };
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

	// Fetch property data
	const { data: property, error } = await supabase
		.from('properties')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !property) {
		redirect(`/${locale}/dashboard/properties`);
	}

	const t = await getTranslations('properties');

	return (
		<div className="container mx-auto px-4 py-8 sm:px-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">{t('edit.title')}</h1>
				<p className="text-muted-foreground">{t('edit.description')}</p>
			</div>
			<div className="bg-white shadow rounded-lg p-6">
				<EditPropertyForm
					userId={user.id}
					locale={locale}
					propertyId={id}
					property={property}
				/>
			</div>
		</div>
	);
}