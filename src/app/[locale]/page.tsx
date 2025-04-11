import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations();

	return (
		<div className="flex flex-col min-h-screen">
			{/* Header */}
			<header className="border-b py-4 px-6">
				<div className="container mx-auto flex justify-between items-center">
					<div className="font-bold text-xl">{t('common.appName')}</div>
					<div className="space-x-4">
						<Button variant="outline" className="px-5">
							{t('auth.login')}
						</Button>
						<Button>{t('auth.signup')}</Button>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="flex-grow">
				<section className="py-16 px-6">
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-12">
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								{t('common.welcome')}
							</h1>
							<p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
								{t('home.hero.description')}
							</p>
							<div className="flex justify-center gap-4">
								<Button size="lg">{t('home.hero.getStarted')}</Button>
								<Button variant="outline" size="lg">
									{t('home.hero.learnMore')}
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section className="py-16 px-6 bg-gray-50">
					<div className="container mx-auto max-w-6xl">
						<h2 className="text-3xl font-bold text-center mb-12">
							{t('home.features.title')}
						</h2>
						<div className="grid md:grid-cols-3 gap-8">
							{[
								{
									title: t('home.features.expenseTracking.title'),
									description: t('home.features.expenseTracking.description'),
								},
								{
									title: t('home.features.propertyManagement.title'),
									description: t('home.features.propertyManagement.description'),
								},
								{
									title: t('home.features.sharedCosts.title'),
									description: t('home.features.sharedCosts.description'),
								},
							].map((feature, index) => (
								<div key={index} className="p-6 border rounded-lg bg-white">
									<h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
									<p>{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>

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
							<Link href="/about" className="text-sm hover:underline">
								{t('navigation.about')}
							</Link>
							<Link href="/privacy" className="text-sm hover:underline">
								{t('navigation.privacy')}
							</Link>
							<Link href="/terms" className="text-sm hover:underline">
								{t('navigation.terms')}
							</Link>
							<Link href="/contact" className="text-sm hover:underline">
								{t('navigation.contact')}
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
