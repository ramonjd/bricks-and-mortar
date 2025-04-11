import LoginFormFields from './LoginFormFields';

export default function LoginForm() {
	return (
		<div className="mx-auto max-w-sm space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">Welcome back</h1>
				<p className="text-gray-500 dark:text-gray-400">
					Enter your credentials to sign in to your account
				</p>
			</div>
			<LoginFormFields />
		</div>
	);
}
