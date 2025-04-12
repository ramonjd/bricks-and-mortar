'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { LogoutButton } from '@/components/auth/LogoutButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type HeaderProps = {
	locale: string;
};

export function Header({ locale }: HeaderProps) {
	const t = useTranslations();
	const pathname = usePathname();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const { data } = await supabase.auth.getSession();
				setIsAuthenticated(!!data.session);
			} catch (error) {
				console.error('Error checking authentication status:', error);
				setIsAuthenticated(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();

		// Set up auth state change listener
		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			setIsAuthenticated(!!session);
		});

		return () => {
			authListener.subscription.unsubscribe();
		};
	}, []);

	// Don't show auth buttons on auth pages
	const isAuthPage =
		pathname.includes('/login') ||
		pathname.includes('/register') ||
		pathname.includes('/forgot-password') ||
		pathname.includes('/reset-password');

	return (
		<header className="border-b py-4 px-6">
			<div className="container mx-auto flex justify-between items-center">
				<div className="font-bold text-xl">
					<Link href={`/${locale}`}>{t('common.appName')}</Link>
				</div>
				<div className="space-x-4">
					{!isLoading && !isAuthPage && (
						<>
							{isAuthenticated ? (
								<>
									<Link
										href={`/${locale}/dashboard`}
										className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									>
										{t('dashboard.title')}
									</Link>
									<LogoutButton variant="outline" />
								</>
							) : (
								<>
									<Link
										href={`/${locale}/login`}
										className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									>
										{t('auth.login')}
									</Link>
									<Link
										href={`/${locale}/register`}
										className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									>
										{t('auth.signup')}
									</Link>
								</>
							)}
						</>
					)}
					<div className="absolute top-4 right-4 z-50">
						<LanguageSwitcher />
					</div>
				</div>
			</div>
		</header>
	);
}
