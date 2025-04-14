// Type definitions for Google Maps JavaScript API
declare global {
	interface Window {
		google: typeof google;
	}
}

declare namespace google.maps {
	class Map {
		constructor(mapDiv: Element, opts?: MapOptions);
		setCenter(latLng: LatLng | LatLngLiteral): void;
		setZoom(zoom: number): void;
		fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
	}

	class Marker {
		constructor(opts?: MarkerOptions);
		setMap(map: Map | null): void;
	}

	class LatLng {
		constructor(lat: number, lng: number, noWrap?: boolean);
		lat(): number;
		lng(): number;
	}

	class LatLngBounds {
		constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
		extend(point: LatLng | LatLngLiteral): LatLngBounds;
	}

	interface LatLngLiteral {
		lat: number;
		lng: number;
	}

	interface LatLngBoundsLiteral {
		east: number;
		north: number;
		south: number;
		west: number;
	}

	interface MapOptions {
		center?: LatLng | LatLngLiteral;
		zoom?: number;
		mapTypeId?: string;
		mapTypeControl?: boolean;
	}

	interface MarkerOptions {
		position: LatLng | LatLngLiteral;
		map?: Map;
		title?: string;
		icon?: string;
	}
}

declare namespace google.maps.places {
	class Autocomplete extends google.maps.MVCObject {
		constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
		getPlace(): PlaceResult;
		bindTo(
			bindKey: string,
			target: google.maps.MVCObject,
			targetKey?: string,
			noNotify?: boolean
		): void;
		addListener(eventName: string, handler: () => void): google.maps.MapsEventListener;
	}

	interface AutocompleteOptions {
		bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
		componentRestrictions?: ComponentRestrictions;
		types?: string[];
		fields?: string[];
	}

	interface ComponentRestrictions {
		country: string | string[];
	}

	interface PlaceResult {
		formatted_address?: string;
		geometry?: {
			location: google.maps.LatLng;
			viewport?: google.maps.LatLngBounds;
		};
		name?: string;
		address_components?: AddressComponent[];
	}

	interface AddressComponent {
		long_name: string;
		short_name: string;
		types: string[];
	}
}

declare namespace google.maps {
	class MVCObject {
		constructor();
	}

	interface MapsEventListener {
		remove(): void;
	}
}

export {};
