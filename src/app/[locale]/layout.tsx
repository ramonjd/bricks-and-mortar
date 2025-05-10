import { MantineProvider, createTheme } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales, Locale } from '@/lib/i18n/config';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import '@mantine/core/styles.css';
import '../globals.css';

const theme = createTheme({
	primaryColor: 'blue',
	colors: {
		blue: [
			'#E3F2FD',
			'#BBDEFB',
			'#90CAF9',
			'#64B5F6',
			'#42A5F5',
			'#2196F3',
			'#1E88E5',
			'#1976D2',
			'#1565C0',
			'#0D47A1',
		],
	},
	fontFamily: 'var(--font-body)',
	headings: {
		fontFamily: 'var(--font-headings)',
	},
});

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
		<html lang={locale}>
			<body>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<MantineProvider theme={theme}>
						<div className="flex flex-col min-h-screen">
							<Header locale={locale} />
							{children}
						</div>
					</MantineProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
