'use client';

import { useLocale, usePathname, useRouter } from '@/lib/i18n/client';
import { locales } from '@/lib/i18n/config';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // Replace the locale segment in the pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}
        </option>
      ))}
    </select>
  );
}