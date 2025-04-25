declare namespace google.maps {
	interface GeocoderResult {
		geometry: {
			location: {
				lat(): number;
				lng(): number;
			};
		};
		formatted_address: string;
	}

	type GeocoderStatus =
		| 'OK'
		| 'ZERO_RESULTS'
		| 'OVER_QUERY_LIMIT'
		| 'REQUEST_DENIED'
		| 'INVALID_REQUEST'
		| 'UNKNOWN_ERROR';

	class Geocoder {
		geocode(
			request: { address: string } | { location: { lat: number; lng: number } },
			callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
		): void;
	}

	class Map {
		constructor(element: HTMLElement, options: MapOptions);
		setCenter(location: { lat: number; lng: number }): void;
		setZoom(zoom: number): void;
	}

	interface MapOptions {
		center: { lat: number; lng: number };
		zoom: number;
	}

	class Marker {
		constructor(options: MarkerOptions);
		setMap(map: Map | null): void;
	}

	interface MarkerOptions {
		position: { lat: number; lng: number };
		map: Map;
	}
}
