import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthLayoutProps = {
	children: ReactNode;
	title: string;
	subtitle?: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold">{title}</h2>
				{subtitle && <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>}
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<Card>
					<CardHeader>
						<CardTitle className="text-xl">{title}</CardTitle>
						{subtitle && <CardDescription>{subtitle}</CardDescription>}
					</CardHeader>
					<CardContent>{children}</CardContent>
				</Card>
			</div>
		</div>
	);
}
