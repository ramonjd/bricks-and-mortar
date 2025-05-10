'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
	const searchParams = useSearchParams();
	const storedPropertyId = searchParams.get('storedPropertyId');

	useEffect(() => {
		try {
			// First check for a selected property
			const selectedProperty = localStorage.getItem('selected_property');
			if (selectedProperty) {
				try {
					const parsedData = JSON.parse(selectedProperty);
					console.log('Using selected property:', parsedData);
					setPrefilledData(parsedData);
					// Clear the selected property after using it
					localStorage.removeItem('selected_property');
					return;
				} catch (error) {
					console.error('Error parsing selected property data:', error);
				}
			}

			// If no selected property, check for stored properties
			const storedPropertiesData = localStorage.getItem('get_started_properties');
			console.log('Stored Properties Data:', storedPropertiesData);

			if (storedPropertiesData) {
				try {
					const parsedData = JSON.parse(storedPropertiesData);
					console.log('Parsed Data:', parsedData);

					if (storedPropertyId) {
						// If we have a specific property ID, find that property
						if (Array.isArray(parsedData)) {
							const property = parsedData.find((p) => p.id === storedPropertyId);
							if (property) {
								console.log('Using property with ID:', property);
								setPrefilledData(property);
							}
						}
					} else if (Array.isArray(parsedData) && parsedData.length > 0) {
						// If no specific ID, use the first property
						console.log('Using first property:', parsedData[0]);
						setPrefilledData(parsedData[0]);
					} else if (parsedData) {
						// If it's a single property object
						console.log('Using single property object:', parsedData);
						setPrefilledData(parsedData);
					}
				} catch (error) {
					console.error('Error parsing stored property data:', error);
				}
			}
		} catch (error) {
			console.error('Error retrieving prefilled property data from localStorage:', error);
		}
	}, [storedPropertyId]);

	const handleFormSubmit = async () => {
		// If we have a stored property ID, remove it from localStorage after successful submission
		if (storedPropertyId) {
			const storedPropertiesData = localStorage.getItem('get_started_properties');
			if (storedPropertiesData) {
				try {
					const parsedData = JSON.parse(storedPropertiesData);
					if (Array.isArray(parsedData)) {
						const updatedProperties = parsedData.filter(
							(p) => p.id !== storedPropertyId
						);
						localStorage.setItem(
							'get_started_properties',
							JSON.stringify(updatedProperties)
						);
					}
				} catch (error) {
					console.error('Error updating stored properties:', error);
				}
			}
		}
	};

	console.log('Current prefilledData state:', prefilledData);

	return (
		<NewPropertyForm
			userId={userId}
			locale={locale}
			prefilledData={prefilledData}
			onFormSubmit={handleFormSubmit}
		/>
	);
}