'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NotFound() {
	const t = useTranslations('NotFound');
	const { locale } = useParams();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center px-4">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-gray-700 mb-6">{t('title')}</h2>
				<p className="text-gray-600 mb-8">{t('description')}</p>
				<Link
					href={`/${locale}`}
					className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					{t('backHome')}
				</Link>
			</div>
		</div>
	);
}
