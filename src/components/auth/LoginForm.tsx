import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { signIn } from '@/lib/services/auth';

export function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('auth');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			await signIn({ email, password });
			router.push(`/${locale}/dashboard`);
			router.refresh();
		} catch (err) {
			console.error('Login error:', err);
			setError(t('loginError'));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			{error && (
				<div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>
			)}

			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					{t('emailAddress')}
				</label>
				<div className="mt-1">
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<label htmlFor="password" className="block text-sm font-medium text-gray-700">
					{t('password')}
				</label>
				<div className="mt-1">
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
					/>
				</div>
			</div>

			<div>
				<Button 
					type="submit" 
					className="w-full"
					disabled={isLoading}
				>
					{isLoading ? t('loggingIn') : t('login')}
				</Button>
			</div>
		</form>
	);
}