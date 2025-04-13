import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import Link from 'next/link';

type Props = {
	params: { locale: string };
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function GoodbyePage({ params: { locale } }: Props) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const t = await getTranslations('goodbye');

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
			<div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
				<div className="space-y-4">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900">
						{t('title')}
					</h1>
					<p className="text-gray-600">{t('message')}</p>
				</div>

				<div className="mt-6">
					<Link
						href={`/${locale}/register`}
						className="inline-flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
					>
						{t('signUpAgain')}
					</Link>
				</div>
			</div>
		</div>
	);
}
