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
			// Get the property id from the URL
			const searchParams = new URLSearchParams(window.location.search);
			const propertyId = searchParams.get('property');
			console.log('Property ID from URL:', propertyId);

			// Try to get prefilled data from sessionStorage
			const storedSessionId = sessionStorage.getItem('property_session_id');
			console.log('Stored Session ID:', storedSessionId);

			if (storedSessionId) {
				const storedPropertiesData = sessionStorage.getItem(
					`property_addresses_${storedSessionId}`
				);
				console.log('Stored Properties Data:', storedPropertiesData);

				if (storedPropertiesData) {
					try {
						const parsedData = JSON.parse(storedPropertiesData);
						console.log('Parsed Data:', parsedData);

						// If we have an array of properties
						if (Array.isArray(parsedData)) {
							// If we have a property ID, find that specific property
							if (propertyId) {
								const property = parsedData.find((p: any) => p.id === propertyId);
								console.log('Found Property by ID:', property);
								if (property) {
									setPrefilledData(property);
								}
							} else {
								// Otherwise use the first property
								console.log('Using first property:', parsedData[0]);
								setPrefilledData(parsedData[0] || {});
							}
						} else {
							// If it's a single property object
							console.log('Using single property object:', parsedData);
							setPrefilledData(parsedData);
						}
					} catch (error) {
						console.error('Error parsing stored property data:', error);
					}
				}

				// Remove the data from sessionStorage after retrieving it
				// sessionStorage.removeItem(`property_addresses_${storedSessionId}`);
			}
		} catch (error) {
			console.error('Error retrieving prefilled property data:', error);
		}
	}, []);

	console.log('Current prefilledData state:', prefilledData);

	return <NewPropertyForm userId={userId} locale={locale} prefilledData={prefilledData} />;
}
