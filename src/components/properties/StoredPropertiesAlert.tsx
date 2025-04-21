'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';

interface StoredProperty {
	id: string;
	name: string;
	address: string;
	property_type?: string;
	bedrooms?: number;
	bathrooms?: number;
	square_meters?: number;
	year_built?: number;
	purchase_price?: number;
	current_value?: number;
	description?: string;
	latitude?: number;
	longitude?: number;
}

interface StoredPropertiesAlertProps {
	locale: string;
	onSelectProperty: (property: StoredProperty) => void;
}

export default function StoredPropertiesAlert({
	locale,
	onSelectProperty,
}: StoredPropertiesAlertProps) {
	const t = useTranslations('properties');
	const [storedProperties, setStoredProperties] = useState<StoredProperty[]>([]);
	const [isVisible, setIsVisible] = useState(true);
	const router = useRouter();

	useEffect(() => {
		try {
			const storedSessionId = sessionStorage.getItem('property_session_id');
			console.log('StoredPropertiesAlert - Session ID:', storedSessionId);

			if (storedSessionId) {
				const storedPropertiesData = sessionStorage.getItem(
					`property_addresses_${storedSessionId}`
				);
				console.log('StoredPropertiesAlert - Raw Data:', storedPropertiesData);

				if (storedPropertiesData) {
					const parsedData = JSON.parse(storedPropertiesData);
					console.log('StoredPropertiesAlert - Parsed Data:', parsedData);
					setStoredProperties(Array.isArray(parsedData) ? parsedData : [parsedData]);
				}
			}
		} catch (error) {
			console.error('Error retrieving properties from sessionStorage:', error);
		}
	}, []);

	const handlePropertyClick = (property: StoredProperty) => {
		console.log('Property clicked:', property);
		onSelectProperty(property);
		router.push(`/${locale}/dashboard/properties/new?property=${property.id}`);
	};

	const clearStoredProperties = () => {
		try {
			const storedSessionId = sessionStorage.getItem('property_session_id');
			sessionStorage.removeItem(`property_addresses_${storedSessionId}`);
			setStoredProperties([]);
		} catch (error) {
			console.error('Error clearing properties from sessionStorage:', error);
		}
	};

	const dismissAlert = () => {
		setIsVisible(false);
	};

	if (!isVisible || storedProperties.length === 0) {
		return null;
	}

	return (
		<Alert className="mb-6 bg-blue-50 border-blue-200">
			<div className="flex justify-between items-start">
				<div>
					<AlertTitle className="text-blue-800">{t('storedProperties.title')}</AlertTitle>
					<AlertDescription className="mt-2">
						{t('storedProperties.description')}
						<ul className="mt-2 space-y-1">
							{storedProperties.map((property, index) => (
								<li key={index} className="flex items-center">
									<Button
										variant="link"
										className="p-0 h-auto text-blue-600 hover:text-blue-800 justify-start"
										onClick={() => handlePropertyClick(property)}
									>
										{property.name} - {property.address}
									</Button>
								</li>
							))}
						</ul>
					</AlertDescription>
				</div>
				<div className="flex space-x-2">
					<Button
						variant="outline"
						size="sm"
						className="text-sm"
						onClick={clearStoredProperties}
					>
						{t('storedProperties.clearAll')}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-gray-500"
						onClick={dismissAlert}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</Alert>
	);
}
