'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { StoredProperty } from '@/types';

interface StoredPropertiesAlertWrapperProps {
	locale: string;
}

export default function StoredPropertiesAlertWrapper({
	locale,
}: StoredPropertiesAlertWrapperProps) {
	const t = useTranslations('properties.storedProperties');
	const router = useRouter();
	const [storedProperties, setStoredProperties] = useState<StoredProperty[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const hasCheckedRef = useRef(false);

	// Check for stored properties in localStorage and filter out those already in DB
	useEffect(() => {
		const checkAndFilterProperties = async () => {
			// Prevent duplicate checks
			if (hasCheckedRef.current) return;
			hasCheckedRef.current = true;

			const storedData = localStorage.getItem('get_started_properties');
			if (!storedData) return;
			try {
				const parsedData: StoredProperty[] = JSON.parse(storedData);
				if (!Array.isArray(parsedData) || parsedData.length === 0) return;
				// Collect all addresses
				const addresses = parsedData.map((p) => p.address);
				// Send a single request to check all addresses
				const res = await fetch('/api/properties/find-by-address', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ addresses }),
				});
				const data = await res.json();
				if (data.results) {
					// Filter out properties that exist in the DB
					const filtered = parsedData.filter((p) => !data.results[p.address]);
					setStoredProperties(filtered);
					setIsVisible(filtered.length > 0);
					// Update localStorage
					localStorage.setItem('get_started_properties', JSON.stringify(filtered));
				}
			} catch (error) {
				console.error('Error parsing or filtering stored properties:', error);
			}
		};
		checkAndFilterProperties();
	}, []);

	const handlePropertyClick = (property: StoredProperty) => {
		// Store the selected property in localStorage for the new property form
		localStorage.setItem('selected_property', JSON.stringify(property));
		// Navigate to the new property form with the stored property ID
		router.push(`/${locale}/dashboard/properties/new?storedPropertyId=${property.id}`);
	};

	const handleRemove = (id: string) => {
		const updated = storedProperties.filter((p) => p.id !== id);
		setStoredProperties(updated);
		localStorage.setItem('get_started_properties', JSON.stringify(updated));
		if (updated.length === 0) setIsVisible(false);
	};

	const handleDismiss = () => {
		setIsVisible(false);
		localStorage.removeItem('get_started_properties');
		setStoredProperties([]);
	};

	if (!isVisible || storedProperties.length === 0) {
		return null;
	}

	return (
		<Alert className="mb-4">
			<AlertTitle>{t('title')}</AlertTitle>
			<AlertDescription>
				<p className="mb-2">
					{t('description', {
						count: storedProperties.length,
					})}
				</p>
				<ul className="mb-4 space-y-2">
					{storedProperties.map((property) => (
						<li key={property.id} className="flex items-center justify-between">
							<div className="flex-1">
								<p className="font-medium">{property.address}</p>
								{(property.country || property.state) && (
									<p className="text-sm text-gray-500">
										{property.state && `${property.state}, `}
										{property.country}
									</p>
								)}
							</div>
							<div className="flex gap-2">
								<Button
									onClick={() => handlePropertyClick(property)}
									variant="outline"
									size="sm"
									className="min-w-[100px]"
								>
									{t('create')}
								</Button>
								<Button
									onClick={() => handleRemove(property.id)}
									variant="destructive"
									size="sm"
									className="min-w-[80px]"
								>
									{t('remove')}
								</Button>
							</div>
						</li>
					))}
				</ul>
				<div className="flex gap-2">
					<Button onClick={handleDismiss} variant="outline">
						{t('dismiss')}
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	);
}
