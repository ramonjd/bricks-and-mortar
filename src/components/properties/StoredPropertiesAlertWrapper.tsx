'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface StoredProperty {
	id: string;
	name: string;
	address: string;
	// Add other property fields as needed
}

interface StoredPropertiesAlertWrapperProps {
	locale: string;
}

export default function StoredPropertiesAlertWrapper({
	locale,
}: StoredPropertiesAlertWrapperProps) {
	const t = useTranslations('properties');
	const router = useRouter();
	const [storedProperties, setStoredProperties] = useState<StoredProperty[]>([]);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Check for stored properties in sessionStorage
		const storedData = sessionStorage.getItem('storedProperties');
		if (storedData) {
			try {
				const parsedData = JSON.parse(storedData);
				if (Array.isArray(parsedData) && parsedData.length > 0) {
					setStoredProperties(parsedData);
					setIsVisible(true);
				}
			} catch (error) {
				console.error('Error parsing stored properties:', error);
			}
		}
	}, []);

	const handleImport = () => {
		// TODO: Implement import functionality
		// This should navigate to the import page or handle the import process
		router.push(`/${locale}/dashboard/properties/import`);
	};

	const handleDismiss = () => {
		setIsVisible(false);
		sessionStorage.removeItem('storedProperties');
	};

	if (!isVisible) {
		return null;
	}

	return (
		<Alert className="mb-4">
			<AlertTitle>{t('alerts.storedProperties.title')}</AlertTitle>
			<AlertDescription>
				<p className="mb-2">
					{t('alerts.storedProperties.description', {
						count: storedProperties.length,
					})}
				</p>
				<div className="flex gap-2">
					<Button onClick={handleImport} variant="default">
						{t('alerts.storedProperties.import')}
					</Button>
					<Button onClick={handleDismiss} variant="outline">
						{t('alerts.storedProperties.dismiss')}
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	);
}
