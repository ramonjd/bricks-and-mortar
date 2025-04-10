import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

// This page will only be displayed in development when the middleware doesn't run
export default function Home() {
  redirect(`/${defaultLocale}`);
}