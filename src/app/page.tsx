import { redirect } from 'next/navigation';
import { locales } from '@/lib/i18n/config';

// This page will only be displayed in development when the middleware doesn't run
export default function RootPage() {
	redirect(`/${locales[0]}`);
}
