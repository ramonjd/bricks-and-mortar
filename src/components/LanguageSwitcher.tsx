'use client';

import { useLocale, usePathname, useRouter } from '@/lib/i18n/client';
import { locales } from '@/lib/i18n/config';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function LanguageSwitcher() {
	const pathname = usePathname();
	const router = useRouter();
	const currentLocale = useLocale();

	const handleValueChange = (newLocale: string) => {
		router.replace(pathname, { locale: newLocale });
	};

	return (
		<Select value={currentLocale} onValueChange={handleValueChange}>
			<SelectTrigger className="w-[100px]">
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{locales.map((locale) => (
						<SelectItem key={locale} value={locale}>
							{locale === 'en' ? '🇬🇧 EN' : '🇩🇪 DE'}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
