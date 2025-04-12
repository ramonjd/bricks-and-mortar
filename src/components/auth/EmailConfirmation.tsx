import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EmailConfirmation() {
	const locale = useLocale();
	const t = useTranslations('auth');

	return (
		<div className="text-center">
			<div className="mb-4 text-green-500">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-16 w-16 mx-auto"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>
			<h3 className="mb-4 text-lg font-medium text-gray-900">{t('emailConfirmed')}</h3>
			<p className="text-gray-600 mb-6">{t('loginToYourAccount')}</p>
			<Link href={`/${locale}/login`}>
				<Button>{t('login')}</Button>
			</Link>
		</div>
	);
}
