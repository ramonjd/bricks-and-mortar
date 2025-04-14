'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { v4 as uuidv4 } from 'uuid';

interface Address {
	id: string;
	address: string;
	lat: number;
	lng: number;
}

export default function GetStarted() {
	const t = useTranslations();
	const [map, setMap] = useState<any>(null);
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [sessionId, setSessionId] = useState<string>('');
	const [isMapLoaded, setIsMapLoaded] = useState(false);

	// Initialize session ID on first load
	useEffect(() => {
		// Create or retrieve session ID
		let storedSessionId = sessionStorage.getItem('property_session_id');
		if (!storedSessionId) {
			storedSessionId = uuidv4();
			sessionStorage.setItem('property_session_id', storedSessionId);
		}
		setSessionId(storedSessionId);

		// Load stored addresses
		const storedAddresses = sessionStorage.getItem(`property_addresses_${storedSessionId}`);
		if (storedAddresses) {
			setAddresses(JSON.parse(storedAddresses));
		}

		// Load Google Maps API
		if (!(window as any).google) {
			const script = document.createElement('script');
			// Replace with actual API key in .env.local
			const apiKey =
				process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
			script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
			script.async = true;
			script.onload = () => setIsMapLoaded(true);
			document.head.appendChild(script);
			return () => {
				document.head.removeChild(script);
			};
		} else {
			setIsMapLoaded(true);
		}
	}, []);

	// Initialize map and autocomplete once Google Maps is loaded
	useEffect(() => {
		if (!isMapLoaded) return;

		const mapElement = document.getElementById('map');
		if (mapElement) {
			const google = (window as any).google;
			const newMap = new google.maps.Map(mapElement, {
				center: { lat: 40.749933, lng: -73.98633 },
				zoom: 13,
				mapTypeControl: false,
			});
			setMap(newMap);

			const input = document.getElementById('address-input') as HTMLInputElement;
			const autocomplete = new google.maps.places.Autocomplete(input, {
				fields: ['formatted_address', 'geometry'],
			});
			autocomplete.bindTo('bounds', newMap);

			autocomplete.addListener('place_changed', () => {
				const place = autocomplete.getPlace();

				if (!place.geometry || !place.geometry.location) {
					window.alert('No details available for this place');
					return;
				}

				if (place.geometry.viewport) {
					newMap.fitBounds(place.geometry.viewport);
				} else {
					newMap.setCenter(place.geometry.location);
					newMap.setZoom(17);
				}

				// Create a marker for the selected place
				new google.maps.Marker({
					position: place.geometry.location,
					map: newMap,
				});

				// Add address to the list
				addAddress(
					place.formatted_address || 'Unknown address',
					place.geometry.location.lat(),
					place.geometry.location.lng()
				);
			});
		}
	}, [isMapLoaded]);

	// Save addresses to session storage whenever they change
	useEffect(() => {
		if (sessionId && addresses.length >= 0) {
			sessionStorage.setItem(`property_addresses_${sessionId}`, JSON.stringify(addresses));
		}
	}, [addresses, sessionId]);

	const addAddress = (address: string, lat: number, lng: number) => {
		const newAddress: Address = {
			id: uuidv4(),
			address,
			lat,
			lng,
		};
		setAddresses((prev) => [...prev, newAddress]);
	};

	const deleteAddress = (id: string) => {
		setAddresses((prev) => prev.filter((address) => address.id !== id));
	};

	const viewOnMap = (address: Address) => {
		if (map) {
			map.setCenter({ lat: address.lat, lng: address.lng });
			map.setZoom(17);

			// Create a marker for the selected place
			const google = (window as any).google;
			new google.maps.Marker({
				position: { lat: address.lat, lng: address.lng },
				map: map,
			});
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">{t('getStarted')}</h1>

			<div className="mb-8">
				<label
					htmlFor="address-input"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Search for a property address
				</label>
				<input
					id="address-input"
					type="text"
					placeholder="Enter an address"
					className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				/>
			</div>

			<div id="map" className="w-full h-96 rounded-lg shadow-md mb-8"></div>

			{addresses.length > 0 && (
				<div className="bg-white shadow-md rounded-lg p-4">
					<h2 className="text-xl font-semibold mb-4">Your Saved Addresses</h2>
					<ul className="divide-y divide-gray-200">
						{addresses.map((address) => (
							<li key={address.id} className="py-4">
								<div className="flex justify-between items-start">
									<div>
										<p className="text-lg font-medium">{address.address}</p>
										<p className="text-sm text-gray-500">
											Lat: {address.lat.toFixed(6)}, Lng:{' '}
											{address.lng.toFixed(6)}
										</p>
									</div>
									<div className="flex space-x-2">
										<button
											onClick={() => viewOnMap(address)}
											className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
										>
											View on Map
										</button>
										<button
											onClick={() => deleteAddress(address.id)}
											className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
										>
											Delete
										</button>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
