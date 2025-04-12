'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button, ButtonProps } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

type LogoutButtonProps = {
	variant?: ButtonProps['variant'];
	size?: ButtonProps['size'];
	className?: string;
};

export function LogoutButton({
	variant = 'outline',
	size = 'default',
	className = '',
}: LogoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			const { error } = await supabase.auth.signOut();
			if (error) {
				throw error;
			}
			window.location.href = `/${locale}`;
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={handleLogout}
			disabled={isLoading}
		>
			{isLoading ? t('loggingOut') : t('logout')}
		</Button>
	);
}
