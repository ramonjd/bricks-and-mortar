import Link from 'next/link';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations();

	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="bg-white py-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
							{t('home.hero.title')}
						</h1>
						<p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
							{t('home.hero.description')}
						</p>
						<div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
							<div className="rounded-md shadow">
								<Link
									href={`/${locale}/register`}
									className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
								>
									{t('getStarted')}
								</Link>
							</div>
							<div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
								<Link
									href={`/${locale}/about`}
									className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
								>
									{t('home.hero.learnMore')}
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-12 bg-gray-50">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
							{t('home.features.title')}
						</h2>
					</div>

					<div className="mt-10">
						<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
							{/* Feature 1 */}
							<div className="bg-white overflow-hidden shadow rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium text-gray-900">
										{t('home.features.expenseTracking.title')}
									</h3>
									<p className="mt-2 text-base text-gray-500">
										{t('home.features.expenseTracking.description')}
									</p>
								</div>
							</div>

							{/* Feature 2 */}
							<div className="bg-white overflow-hidden shadow rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium text-gray-900">
										{t('home.features.propertyManagement.title')}
									</h3>
									<p className="mt-2 text-base text-gray-500">
										{t('home.features.propertyManagement.description')}
									</p>
								</div>
							</div>

							{/* Feature 3 */}
							<div className="bg-white overflow-hidden shadow rounded-lg">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium text-gray-900">
										{t('home.features.sharedCosts.title')}
									</h3>
									<p className="mt-2 text-base text-gray-500">
										{t('home.features.sharedCosts.description')}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-8 px-6">
				<div className="container mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<div className="mb-4 md:mb-0">
							<p className="text-sm">
								© {new Date().getFullYear()} {t('common.appName')}.{' '}
								{t('common.allRightsReserved')}.
							</p>
						</div>
						<div className="flex gap-6">
							<Link href={`/${locale}/about`} className="text-sm hover:underline">
								{t('navigation.about')}
							</Link>
							<Link href={`/${locale}/privacy`} className="text-sm hover:underline">
								{t('navigation.privacy')}
							</Link>
							<Link href={`/${locale}/terms`} className="text-sm hover:underline">
								{t('navigation.terms')}
							</Link>
							<Link href={`/${locale}/contact`} className="text-sm hover:underline">
								{t('navigation.contact')}
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
