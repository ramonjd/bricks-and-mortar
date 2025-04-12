import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UserProfileForm from '@/components/profile/UserProfileForm';

export default async function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Check if user is authenticated
	if (!session) {
		redirect(`/${locale}/login`);
	}

	const t = await getTranslations();

	// Fetch the user profile data if it exists
	const { data: profile } = await supabase
		.from('user_profiles')
		.select('*')
		.eq('user_id', session.user.id)
		.single();

	return (
		<div className="min-h-screen bg-gray-50">
			<main className="container mx-auto px-4 py-8 sm:px-6">
				<div className="bg-white shadow rounded-lg p-6">
					<h2 className="text-2xl font-semibold text-gray-900 mb-6">
						{t('profile.title')}
					</h2>
					<UserProfileForm
						userId={session.user.id}
						email={session.user.email || ''}
						initialProfile={profile}
					/>
				</div>
			</main>
		</div>
	);
}
