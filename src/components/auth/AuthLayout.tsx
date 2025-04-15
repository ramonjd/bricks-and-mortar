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
				<Card>
					<CardHeader>
						<CardTitle className="text-xl mt-2">{title}</CardTitle>
						{subtitle && <CardDescription>{subtitle}</CardDescription>}
					</CardHeader>
					<CardContent>{children}</CardContent>
				</Card>
			</div>
		</div>
	);
}
