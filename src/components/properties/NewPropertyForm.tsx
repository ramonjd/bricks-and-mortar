'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Toaster, toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Declare Google Maps types
declare global {
	interface Window {
		// @ts-expect-error - do later
		google: typeof google;
	}
}

// Define the form schema with proper types
const formSchema = z.object({
	// Basic information
	name: z.string().min(1, 'Name is required'),
	address: z.string().min(1, 'Address is required'),
	latitude: z.number().optional(),
	longitude: z.number().optional(),

	// Property details
	property_type: z.string().min(1, 'Property type is required'),
	year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
	bedrooms: z.number().min(0).optional(),
	bathrooms: z.number().min(0).optional(),
	square_meters: z.number().min(0).optional(),

	// Financial information
	purchase_price: z.number().min(0).optional(),
	current_value: z.number().min(0).optional(),
	description: z.string().optional(),

	// Common fields
	status: z.string().default('active'),
	image_urls: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

type NewPropertyFormProps = {
	userId: string;
	locale: string;
	prefilledData?: Partial<FormData>;
};

export default function NewPropertyForm({
	userId,
	locale,
	prefilledData = {},
}: NewPropertyFormProps) {
	const t = useTranslations('properties');
	const router = useRouter();
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [images, setImages] = useState<File[]>([]);
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
	const [map, setMap] = useState<google.maps.Map | null>(null);
	const [marker, setMarker] = useState<google.maps.Marker | null>(null);
	const geocoder = useRef<google.maps.Geocoder | null>(null);

	// Load Google Maps API
	useEffect(() => {
		if (!(window as any).google) {
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

	// Initialize Google Maps API
	useEffect(() => {
		if (!isMapLoaded) return;

		const mapElement = document.getElementById('property-map');
		if (!mapElement) {
			console.log('Map element not found');
			return;
		}

		console.log('Initializing map with Google Maps API');
		const mapInstance = new google.maps.Map(mapElement, {
			center: { lat: 51.5074, lng: -0.1278 }, // London coordinates
			zoom: 13,
			mapTypeControl: false,
		});

		setMap(mapInstance);
		geocoder.current = new google.maps.Geocoder();

		// Add click listener to map
		mapInstance.addListener('click', handleMapClick);

		// Cleanup function
		return () => {
			if (marker) {
				marker.setMap(null);
			}
		};
	}, [isMapLoaded]);

	// Handle image uploads
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newImages = Array.from(e.target.files);
			setImages((prevImages) => [...prevImages, ...newImages]);

			// Create preview URLs for display
			const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
			setImagePreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
		}
	};

	// Initialize form with proper types
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema) as any,
		defaultValues: {
			name: prefilledData.name || '',
			address: prefilledData.address || '',
			property_type: prefilledData.property_type || t('new.placeholders.selectType'),
			status: prefilledData.status || 'active',
			latitude: prefilledData.latitude || 0,
			longitude: prefilledData.longitude || 0,
			year_built: prefilledData.year_built || new Date().getFullYear() - 10,
			bedrooms: prefilledData.bedrooms || 0,
			bathrooms: prefilledData.bathrooms || 0,
			square_meters: prefilledData.square_meters || 0,
			purchase_price: prefilledData.purchase_price || 0,
			current_value: prefilledData.current_value || 0,
			description: prefilledData.description || '',
			image_urls: prefilledData.image_urls || [],
		},
		mode: 'onBlur',
	});

	// Update the updateMarker function to also update the address field
	const updateMarker = (lat: number, lng: number) => {
		if (!map) return;

		// Remove any existing markers
		if (marker) {
			marker.setMap(null);
		}

		// Create a new marker
		const newMarker = new google.maps.Marker({
			position: { lat, lng },
			map: map,
		});

		// Update the marker state
		setMarker(newMarker);

		// Center the map on the marker
		map.setCenter({ lat, lng });
		map.setZoom(15);

		// Update the address field if a valid address is found
		if (geocoder.current) {
			geocoder.current.geocode(
				{ location: { lat, lng } },
				(
					results: google.maps.GeocoderResult[] | null,
					status: google.maps.GeocoderStatus
				) => {
					if (status === 'OK' && results && results[0]) {
						form.setValue('address', results[0].formatted_address);
						toast.success(t('new.success.addressFound'));
					}
				}
			);
		}
	};

	// Initialize Google Places Autocomplete
	useEffect(() => {
		if (!isMapLoaded) {
			console.log('Map not loaded yet, skipping address search initialization');
			return;
		}

		console.log('Initializing address search');
		const google = (window as unknown as { google: typeof google }).google;
		const addressContainer = document.getElementById('address-search-container');
		if (!addressContainer) {
			console.log('Address search container not found');
			return;
		}

		console.log('Address search container found, creating input element');
		// Clear any existing content
		addressContainer.innerHTML = '';

		// Create input element for autocomplete
		const input = document.createElement('input');
		input.type = 'text';
		input.className = 'w-full px-3 py-2 border rounded-md';
		input.placeholder = t('new.placeholders.address');
		addressContainer.appendChild(input);
		console.log('Input element created and added to container');

		// Create and configure the autocomplete
		console.log('Creating autocomplete');
		const autocomplete = new google.maps.places.Autocomplete(input, {
			types: ['address'],
		});
		console.log('Autocomplete created');

		// Add place_changed event listener
		autocomplete.addListener('place_changed', () => {
			const place = autocomplete.getPlace();

			if (!place.geometry || !place.geometry.location) {
				toast.error(t('new.errors.invalidAddress'));
				return;
			}

			const lat = place.geometry.location.lat();
			const lng = place.geometry.location.lng();

			// Update form values
			form.setValue('address', place.formatted_address || '');
			form.setValue('latitude', lat);
			form.setValue('longitude', lng);
			toast.success(t('new.success.addressFound'));

			// Update the marker
			updateMarker(lat, lng);
		});

		// Add input event listener for manual address entry
		input.addEventListener('input', (e: Event) => {
			const inputElement = e.target as HTMLInputElement;
			if (inputElement.value) {
				const geocoder = new google.maps.Geocoder();
				geocoder.geocode(
					{ address: inputElement.value },
					(
						results: google.maps.GeocoderResult[] | null,
						status: google.maps.GeocoderStatus
					) => {
						if (status === 'OK' && results && results[0]) {
							const location = results[0].geometry.location;
							const lat = location.lat();
							const lng = location.lng();

							// Update form values
							form.setValue('address', results[0].formatted_address);
							form.setValue('latitude', lat);
							form.setValue('longitude', lng);

							// Update the marker
							updateMarker(lat, lng);

							// Show success message
							toast.success(t('new.success.addressFound'));
						}
					}
				);
			}
		});
	}, [isMapLoaded, form, t, map]);

	// Update map when form values change
	useEffect(() => {
		if (!map || !isMapLoaded) return;

		const lat = form.watch('latitude');
		const lng = form.watch('longitude');

		if (lat && lng) {
			// Update the marker
			updateMarker(lat, lng);
		}

		// Cleanup function
		return () => {
			if (marker) {
				marker.setMap(null);
			}
		};
	}, [map, isMapLoaded, form.watch('latitude'), form.watch('longitude')]);

	// Property types
	const propertyTypes = [
		{ value: 'house', label: t('types.house') },
		{ value: 'apartment', label: t('types.apartment') },
		{ value: 'condo', label: t('types.condo') },
		{ value: 'townhouse', label: t('types.townhouse') },
		{ value: 'land', label: t('types.land') },
		{ value: 'commercial', label: t('types.commercial') },
	];

	// Remove image at specific index
	const removeImage = (index: number) => {
		setImages((prevImages) => prevImages.filter((_, i) => i !== index));
		setImagePreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
	};

	// Upload images to storage
	const uploadImages = async (images: File[]) => {
		if (images.length === 0) return [];

		const uploadPromises = images.map(async (image) => {
			const fileExt = image.name.split('.').pop();
			const fileName = `${Math.random()}.${fileExt}`;
			const filePath = `${userId}/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('properties')
				.upload(filePath, image, {
					cacheControl: '3600',
					upsert: false
				});

			if (uploadError) {
				console.error('Error uploading image:', uploadError);
				toast.error(t('new.images.uploadError'));
				return null;
			}

			const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath);
			return urlData.publicUrl;
		});

		const urls = await Promise.all(uploadPromises);
		return urls.filter((url): url is string => url !== null);
	};

	// Update property
	const updateProperty = async (id: string, data: Partial<FormData>) => {
		try {
			const { error } = await supabase.from('properties').update(data).eq('id', id);

			if (error) throw error;

			return true;
		} catch (err) {
			console.error('Error updating property:', err);
			setError(t('new.errors.updateFailed'));
			return false;
		}
	};

	// Handle form submission
	const onSubmit = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			const formValues = form.getValues();
			
			// Create the property
			const { data: propertyData, error: createError } = await supabase
				.from('properties')
				.insert({
					created_by: userId,
					name: formValues.name,
					address: formValues.address,
					latitude: formValues.latitude,
					longitude: formValues.longitude,
					property_type: formValues.property_type,
					year_built: formValues.year_built,
					bedrooms: formValues.bedrooms,
					bathrooms: formValues.bathrooms,
					square_meters: formValues.square_meters,
					purchase_price: formValues.purchase_price,
					current_value: formValues.current_value,
					description: formValues.description,
					status: formValues.status,
				})
				.select('id')
				.single();

			if (createError || !propertyData) {
				setError(createError?.message || 'Failed to create property');
				return;
			}

			if (images.length > 0) {
				const imageUrls = await uploadImages(images);
				if (imageUrls.length > 0) {
					await updateProperty(propertyData.id, { image_urls: imageUrls });
				}
			}

			// Redirect to the property page
			router.push(`/${locale}/dashboard/properties/${propertyData.id}`);
		} catch (err) {
			console.error('Error submitting form:', err);
			setError(t('new.errors.submitFailed'));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle map click
	const handleMapClick = (e: google.maps.MapMouseEvent) => {
		if (!e.latLng) return;

		const lat = e.latLng.lat();
		const lng = e.latLng.lng();

		// Update form values
		form.setValue('latitude', lat);
		form.setValue('longitude', lng);

		// Update the marker
		updateMarker(lat, lng);
	};

	// Handle numeric input changes
	const handleNumericChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		onChange: (value: any) => void
	) => {
		const numValue = e.target.value === '' ? undefined : Number(e.target.value);
		onChange(numValue);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<Card>
					<CardHeader>
						<CardTitle>{t('new.sections.basicInfo')}</CardTitle>
						<CardDescription>{t('new.sections.basicInfoDesc')}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('new.fields.name')}</FormLabel>
									<FormControl>
										<Input
											placeholder={t('new.placeholders.name')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-2">
							<FormLabel>{t('new.fields.address')}</FormLabel>
							<div id="address-search-container" className="relative">
								{/* Google Places Autocomplete will be inserted here */}
							</div>
							<p className="text-xs text-muted-foreground">
								{t('new.googleMaps.placeholder')}
							</p>
						</div>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('new.fields.address')}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t('new.placeholders.address')}
											{...field}
											readOnly
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="latitude"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.latitude')}</FormLabel>
										<FormControl>
											<Input
												placeholder={t('new.placeholders.latitude')}
												{...field}
												readOnly
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="longitude"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.longitude')}</FormLabel>
										<FormControl>
											<Input
												placeholder={t('new.placeholders.longitude')}
												{...field}
												readOnly
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="mt-4">
							<div id="property-map" className="w-full h-64 rounded-md border"></div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t('new.sections.propertyDetails')}</CardTitle>
						<CardDescription>{t('new.sections.propertyDetailsDesc')}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="property_type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('new.fields.propertyType')}</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={t('new.placeholders.selectType')}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{propertyTypes.map((type) => (
												<SelectItem key={type.value} value={type.value}>
													{type.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="year_built"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('new.fields.yearBuilt')}</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min={new Date().getFullYear() - 100}
											max={new Date().getFullYear()}
											onChange={(e) => handleNumericChange(e, field.onChange)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-3 gap-4">
							<FormField
								control={form.control}
								name="bedrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.bedrooms')}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												onChange={(e) =>
													handleNumericChange(e, field.onChange)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bathrooms"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.bathrooms')}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												onChange={(e) =>
													handleNumericChange(e, field.onChange)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="square_meters"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.squareMeters')}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												onChange={(e) =>
													handleNumericChange(e, field.onChange)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t('new.sections.financialInfo')}</CardTitle>
						<CardDescription>{t('new.sections.financialInfoDesc')}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="purchase_price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.purchasePrice')}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												onChange={(e) =>
													handleNumericChange(e, field.onChange)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="current_value"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t('new.fields.currentValue')}</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												onChange={(e) =>
													handleNumericChange(e, field.onChange)
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t('new.fields.description')}</FormLabel>
									<FormControl>
										<Textarea
											placeholder={t('new.placeholders.description')}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t('new.sections.images')}</CardTitle>
						<CardDescription>{t('new.sections.imagesDesc')}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md">
							<label
								htmlFor="image-upload"
								className="flex flex-col items-center justify-center w-full h-32 cursor-pointer"
							>
								<Upload className="w-8 h-8 mb-2 text-gray-400" />
								<span className="text-sm text-gray-500">
									{t('new.images.dropzone')}
								</span>
								<input
									id="image-upload"
									type="file"
									multiple
									accept="image/*"
									className="hidden"
									onChange={handleImageChange}
								/>
							</label>
						</div>

						{imagePreviewUrls.length > 0 && (
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
								{imagePreviewUrls.map((url, index) => (
									<div
										key={index}
										className="relative rounded-md overflow-hidden h-32"
									>
										<div className="absolute top-0 right-0 p-1 z-10">
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="h-6 w-6"
												onClick={() => removeImage(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
										<div className="h-full w-full relative">
											<Image
												src={url}
												alt={`Property image ${index + 1}`}
												fill
												className="object-cover"
											/>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<div className="flex justify-end space-x-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isSubmitting}
					>
						{t('new.actions.cancel')}
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t('new.actions.saving')}
							</>
						) : (
							t('new.actions.save')
						)}
					</Button>
				</div>
			</form>
			<Toaster />
		</Form>
	);
}
