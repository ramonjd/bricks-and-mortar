import { getRequestConfig } from 'next-intl/server';
import { locales, Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
	// Skip locale validation for non-locale requests (like favicon.ico)
	if (!locale || typeof locale !== 'string') {
		return { messages: {} };
	}

	// Validate the locale
	if (!locales.includes(locale as Locale)) {
		console.warn(`Invalid locale: ${locale}, using default messages`);
		return { messages: {} };
	}

	// Import the messages for the requested locale
	return {
		messages: (await import(`./messages/${locale}.json`)).default,
	};
});
