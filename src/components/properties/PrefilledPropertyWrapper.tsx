'use client';

import { useState, useEffect } from 'react';
import NewPropertyForm from './NewPropertyForm';

interface PrefilledPropertyWrapperProps {
	userId: string;
	locale: string;
}

export default function PrefilledPropertyWrapper({
	userId,
	locale,
}: PrefilledPropertyWrapperProps) {
	const [prefilledData, setPrefilledData] = useState<Record<string, unknown>>({});

	useEffect(() => {
		try {
			// Try to get prefilled data from sessionStorage
			const selectedPropertyData = sessionStorage.getItem('selectedProperty');

			if (selectedPropertyData) {
				const parsedData = JSON.parse(selectedPropertyData);
				setPrefilledData(parsedData);

				// Remove the data from sessionStorage after retrieving it
				sessionStorage.removeItem('selectedProperty');
			}
		} catch (error) {
			console.error('Error retrieving prefilled property data:', error);
		}
	}, []);

	return <NewPropertyForm userId={userId} locale={locale} prefilledData={prefilledData} />;
}
