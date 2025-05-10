'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { v4 as uuidv4 } from 'uuid';

// Define a simple type for Google Maps
type GoogleMaps = {
	maps: {
		Map: new (element: HTMLElement, options: MapOptions) => MapInstance;
		Marker: new (options: MarkerOptions) => MarkerInstance;
		places: {
			Autocomplete: new (
				input: HTMLInputElement,
				options: AutocompleteOptions
			) => AutocompleteInstance;
		};
	};
};

// Define specific types for Google Maps objects
interface MapOptions {
	center: { lat: number; lng: number };
	zoom: number;
	mapTypeControl: boolean;
}

interface MapInstance {
	setCenter: (center: { lat: number; lng: number }) => void;
	setZoom: (zoom: number) => void;
	fitBounds: (bounds: any) => void;
}

interface MarkerOptions {
	position: { lat: number; lng: number };
	map: MapInstance;
}

interface MarkerInstance {
	// Marker methods if needed
}

interface AutocompleteOptions {
	fields: string[];
}

interface AutocompleteInstance {
	bindTo: (bounds: string, map: MapInstance) => void;
	addListener: (event: string, callback: () => void) => void;
	getPlace: () => Place;
}

interface Place {
	formatted_address?: string;
	geometry?: {
		location: {
			lat: () => number;
			lng: () => number;
		};
		viewport?: any;
	};
	address_components?: Array<{
		long_name: string;
		short_name: string;
		types: string[];
	}>;
}

interface Address {
	id: string;
	address: string;
	lat: number;
	lng: number;
	country?: string;
	state?: string;
}

export default function GetStarted() {
	const t = useTranslations();
	const [map, setMap] = useState<MapInstance | null>(null);
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [isMapLoaded, setIsMapLoaded] = useState(false);

	// Initialize on first load
	useEffect(() => {
		// Load stored addresses
		const storedAddresses = localStorage.getItem('get_started_properties');
		if (storedAddresses) {
			setAddresses(JSON.parse(storedAddresses));
		}

		// Load Google Maps API
		if (!(window as unknown as { google?: GoogleMaps }).google) {
			const script = document.createElement('script');
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
			const google = (window as unknown as { google: GoogleMaps }).google;
			const newMap = new google.maps.Map(mapElement, {
				center: { lat: 40.749933, lng: -73.98633 },
				zoom: 13,
				mapTypeControl: false,
			});
			setMap(newMap);

			const input = document.getElementById('address-input') as HTMLInputElement;
			const autocomplete = new google.maps.places.Autocomplete(input, {
				fields: ['formatted_address', 'geometry', 'address_components'],
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
					const location = {
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng(),
					};
					newMap.setCenter(location);
					newMap.setZoom(17);
				}

				// Create a marker for the selected place
				new google.maps.Marker({
					position: {
						lat: place.geometry.location.lat(),
						lng: place.geometry.location.lng(),
					},
					map: newMap,
				});

				// Extract country and state from address components
				let country: string | undefined;
				let state: string | undefined;

				if (place.address_components) {
					for (const component of place.address_components) {
						if (component.types.includes('country')) {
							country = component.long_name;
						}
						if (component.types.includes('administrative_area_level_1')) {
							state = component.long_name;
						}
					}
				}

				// Add address to the list
				addAddress(
					place.formatted_address || 'Unknown address',
					place.geometry.location.lat(),
					place.geometry.location.lng(),
					country,
					state
				);
			});
		}
	}, [isMapLoaded]);

	// Save addresses to local storage whenever they change
	useEffect(() => {
		if (addresses.length > 0) {
			localStorage.setItem('get_started_properties', JSON.stringify(addresses));
		}
	}, [addresses]);

	const addAddress = (
		address: string,
		lat: number,
		lng: number,
		country?: string,
		state?: string
	) => {
		const newAddress: Address = {
			id: uuidv4(),
			address,
			lat,
			lng,
			country,
			state,
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
			const google = (window as unknown as { google: GoogleMaps }).google;
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
