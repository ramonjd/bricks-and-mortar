import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { locales, Locale } from '@/lib/i18n/config';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import '../globals.css';

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params: { locale },
}: {
	children: ReactNode;
	params: { locale: string };
}) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	// Validate that the incoming `locale` parameter is valid
	if (!locales.includes(locale as Locale)) {
		notFound();
	}

	let messages;
	try {
		messages = (await import(`@/lib/i18n/messages/${locale}.json`)).default;
	} catch (error) {
		notFound();
	}

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<div className="flex flex-col min-h-screen">
				<Header locale={locale} />
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
