import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function About({ params: { locale } }: { params: { locale: string } }) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = useTranslations();

	return (
		<div className="flex flex-col min-h-screen">
			{/* Header */}
			<header className="border-b py-4 px-6">
				<div className="container mx-auto flex justify-between items-center">
					<div className="font-bold text-xl">
						<Link href={`/${locale}`}>{t('common.appName')}</Link>
					</div>
					<div className="space-x-4">
						<Link href={`/${locale}/auth/login`}>
							<Button variant="outline" className="px-5">
								{t('auth.login')}
							</Button>
						</Link>
						<Link href={`/${locale}/auth/register`}>
							<Button>{t('auth.signup')}</Button>
						</Link>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-grow py-12 px-6">
				<div className="container mx-auto max-w-4xl">
					<h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
						{t('about.title')}
					</h1>
					<p className="text-lg text-center mb-12">{t('about.description')}</p>

					{/* Mission Section */}
					<section className="mb-12">
						<h2 className="text-2xl font-semibold mb-4">{t('about.mission.title')}</h2>
						<p className="mb-6">{t('about.mission.content')}</p>
					</section>

					{/* Story Section */}
					<section className="mb-12">
						<h2 className="text-2xl font-semibold mb-4">{t('about.story.title')}</h2>
						<p className="mb-6">{t('about.story.content')}</p>
					</section>

					{/* Values Section */}
					<section className="mb-12">
						<h2 className="text-2xl font-semibold mb-6">{t('about.values.title')}</h2>
						<div className="grid md:grid-cols-3 gap-6">
							<div className="p-6 border rounded-lg bg-white">
								<h3 className="text-xl font-semibold mb-3">
									{t('about.values.transparency.title')}
								</h3>
								<p>{t('about.values.transparency.content')}</p>
							</div>
							<div className="p-6 border rounded-lg bg-white">
								<h3 className="text-xl font-semibold mb-3">
									{t('about.values.innovation.title')}
								</h3>
								<p>{t('about.values.innovation.content')}</p>
							</div>
							<div className="p-6 border rounded-lg bg-white">
								<h3 className="text-xl font-semibold mb-3">
									{t('about.values.reliability.title')}
								</h3>
								<p>{t('about.values.reliability.content')}</p>
							</div>
						</div>
					</section>

					{/* Team Section */}
					<section className="mb-12">
						<h2 className="text-2xl font-semibold mb-4">{t('about.team.title')}</h2>
						<p className="mb-6">{t('about.team.content')}</p>
					</section>

					{/* CTA */}
					<div className="text-center mt-12">
						<Link href={`/${locale}/auth/register`}>
							<Button size="lg">{t('home.hero.getStarted')}</Button>
						</Link>
					</div>
				</div>
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