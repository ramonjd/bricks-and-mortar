import { getRequestConfig } from 'next-intl/server';
import { locales } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate the locale
  if (!locales.includes(locale as any)) {
    throw new Error(`Invalid locale: ${locale}`);
  }

  // Import the messages for the requested locale
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
