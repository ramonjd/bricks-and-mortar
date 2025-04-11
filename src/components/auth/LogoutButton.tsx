import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/services/auth';

type LogoutButtonProps = {
	variant?: 'primary' | 'secondary' | 'outline';
	size?: 'sm' | 'md' | 'lg';
	className?: string;
};

export function LogoutButton({ 
	variant = 'outline', 
	size = 'md',
	className = ''
}: LogoutButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOut();
			router.push(`/${locale}`);
			router.refresh();
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