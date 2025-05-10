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
	onFormSubmit?: (formData: FormData) => Promise<void>;
};

export default function NewPropertyForm({
	userId,
	locale,
	prefilledData = {},
	onFormSubmit,
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

	const formSchema = z.object({
		name: z.string().min(1, t('new.validation.nameRequired')),
		address: z.string().min(1, t('new.validation.addressRequired')),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		property_type: z.string().min(1, t('new.validation.typeRequired')),
		bedrooms: z.number().min(0),
		bathrooms: z.number().min(0),
		square_meters: z.number().min(0),
		year_built: z.number().min(1800).max(new Date().getFullYear()),
		purchase_date: z.date().optional(),
		purchase_price: z.number().min(0),
		current_value: z.number().min(0),
		description: z.string().optional(),
		status: z.string().default('active'),
		image_urls: z.array(z.string()).default([]),
	});

	type FormData = z.infer<typeof formSchema>;
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
						//toast.success(t('new.success.addressFound'));
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

	// Set form values from prefilledData after form initialization and populate image previews
	useEffect(() => {
		if (prefilledData && Object.keys(prefilledData).length > 0) {
			console.log('Setting form values from prefilledData:', prefilledData);

			// Set each field individually to avoid type issues
			if (prefilledData.address) {
				form.setValue('address', prefilledData.address as string);
			}
			if (prefilledData.latitude) {
				form.setValue('latitude', prefilledData.latitude as number);
			}
			if (prefilledData.longitude) {
				form.setValue('longitude', prefilledData.longitude as number);
			}
			if (prefilledData.name) {
				form.setValue('name', prefilledData.name as string);
			}
			if (prefilledData.property_type) {
				form.setValue('property_type', prefilledData.property_type as string);
			}
			if (prefilledData.year_built) {
				form.setValue('year_built', prefilledData.year_built as number);
			}
			if (prefilledData.bedrooms) {
				form.setValue('bedrooms', prefilledData.bedrooms as number);
			}
			if (prefilledData.bathrooms) {
				form.setValue('bathrooms', prefilledData.bathrooms as number);
			}
			if (prefilledData.square_meters) {
				form.setValue('square_meters', prefilledData.square_meters as number);
			}
			if (prefilledData.purchase_price) {
				form.setValue('purchase_price', prefilledData.purchase_price as number);
			}
			if (prefilledData.current_value) {
				form.setValue('current_value', prefilledData.current_value as number);
			}
			if (prefilledData.description) {
				form.setValue('description', prefilledData.description as string);
			}

			// Set up image previews if the property has images
			if (prefilledData.image_urls && Array.isArray(prefilledData.image_urls)) {
				setImagePreviewUrls(prefilledData.image_urls as string[]);
			}

			// Log the updated form values
			console.log('Updated form values:', form.getValues());
		}
	}, [prefilledData, form]);

	console.log('Form defaultValues:', form.getValues());
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
	const removeImage = async (index: number) => {
		try {
			const imageUrl = imagePreviewUrls[index];
			console.log('Removing image URL:', imageUrl);

			// First update the database record to remove the URL
			if (prefilledData && prefilledData.id) {
				const updatedUrls = [...imagePreviewUrls];
				updatedUrls.splice(index, 1);

				const { error: updateError } = await supabase
					.from('properties')
					.update({ image_urls: updatedUrls })
					.eq('id', prefilledData.id);

				if (updateError) {
					console.error('Error updating property record:', updateError);
					toast.error(t('new.images.updateError'));
					return;
				}
			}

			// Extract the file path from the URL
			const pathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/properties\/(.+)/);
			if (!pathMatch) {
				console.error('Could not extract file path from URL');
				toast.error(t('new.images.deleteError'));
				return;
			}

			const filePath = pathMatch[1];
			console.log('File path to delete:', filePath);

			// Delete the file from storage
			console.log('Attempting to delete from storage with path:', filePath);
			const { error: deleteError } = await supabase.storage
				.from('properties')
				.remove([filePath]);

			if (deleteError) {
				console.error('Error deleting image from storage:', deleteError);
				toast.error(t('new.images.deleteError'));
				return;
			}

			// Create new arrays without the removed image
			const newImages = images.filter((_, i) => i !== index);
			const newPreviewUrls = [...imagePreviewUrls];
			newPreviewUrls.splice(index, 1);

			// Update all state in one go
			await Promise.all([
				// Update form data
				form.setValue('image_urls', newPreviewUrls),
				// Update local state
				new Promise<void>((resolve) => {
					setImages(newImages);
					setImagePreviewUrls(newPreviewUrls);
					resolve();
				}),
			]);

			// Force a re-render of the image grid
			router.refresh();

			toast.success(t('new.images.deleted'));
		} catch (error) {
			console.error('Error removing image:', error);
			toast.error(t('new.images.deleteError'));
		}
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
					upsert: false,
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

	// This function is now handled by the EditPropertyForm component

	// Handle form submission
	const handleSubmit = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			const formData = form.getValues();
			console.log('Submitting form data:', formData);

			// Upload images first
			let imageUrls: string[] = [];
			if (images.length > 0) {
				imageUrls = await uploadImages(images);
			}

			// If we're editing (have prefilledData with id), combine existing image_urls with new ones
			if (prefilledData && prefilledData.id) {
				// Use existing image_urls if present
				const existingImageUrls = prefilledData.image_urls || [];
				formData.image_urls = [...existingImageUrls, ...imageUrls];

				// Call the onFormSubmit prop if provided (for EditPropertyForm)
				if (onFormSubmit) {
					await onFormSubmit(formData);
				}
			} else {
				// Create a new property record
				const { error: createError } = await supabase
					.from('properties')
					.insert([
						{
							...formData,
							created_by: userId,
							image_urls: imageUrls,
						},
					])
					.select()
					.single();

				if (createError) {
					console.error('Error creating property:', createError);
					setError(createError.message);
					return;
				}

				// Call the onFormSubmit prop if provided
				if (onFormSubmit) {
					await onFormSubmit(formData);
				}

				toast.success(t('new.success.created'));
				router.push(`/${locale}/dashboard/properties`);
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			setError(error instanceof Error ? error.message : 'An error occurred');
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
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
								{t(
									prefilledData && prefilledData.id
										? 'new.actions.saving'
										: 'new.actions.creating'
								)}
							</>
						) : (
							t(
								prefilledData && prefilledData.id
									? 'new.actions.save'
									: 'new.actions.create'
							)
						)}
					</Button>
				</div>
			</form>
			<Toaster />
		</Form>
	);
}
