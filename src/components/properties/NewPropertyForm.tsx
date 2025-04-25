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
import { toast } from 'sonner';
import { Resolver } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

// Declare Google Maps types
declare global {
	interface Window {
		// @ts-expect-error - do later
		google: typeof google;
	}
}

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
	const [currentStep, setCurrentStep] = useState(0);
	const [propertyId, setPropertyId] = useState<string | null>(null);
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

	const formSchema = z.object({
		name: z.string().min(1, t('validation.required')),
		address: z.string().min(1, t('validation.required')),
		property_type: z.string().min(1, t('validation.required')),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		bedrooms: z.number().min(0).optional(),
		bathrooms: z.number().min(0).optional(),
		square_meters: z.number().min(0).optional(),
		year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
		purchase_price: z.number().min(0).optional(),
		current_value: z.number().min(0).optional(),
		description: z.string().optional(),
		status: z.string().default('active'),
		image_urls: z.array(z.string()).default([]),
	});

	type FormData = z.infer<typeof formSchema>;

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			address: '',
			property_type: '',
			latitude: undefined,
			longitude: undefined,
			bedrooms: undefined,
			bathrooms: undefined,
			square_meters: undefined,
			year_built: undefined,
			purchase_price: undefined,
			current_value: undefined,
			description: '',
			status: 'active',
			image_urls: [],
		},
		mode: 'onChange',
	});

	// Add step validation state
	const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});

	// Validate current step
	const validateCurrentStep = async () => {
		const currentStepFields = steps[currentStep].fields;
		const isValid = await form.trigger(currentStepFields as any);
		setStepValidation((prev) => ({ ...prev, [currentStep]: isValid }));
		return isValid;
	};

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

	const steps = [
		// Step 1: Name and Address
		{
			title: t('new.steps.step1'),
			fields: ['name', 'address', 'latitude', 'longitude'],
			isValid: () => {
				return !!form.getValues('name') && !!form.getValues('address');
			},
			component: (
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('new.fields.name')}</FormLabel>
								<FormControl>
									<Input placeholder={t('new.placeholders.name')} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="space-y-2">
						<FormLabel>{t('new.fields.address')}</FormLabel>
						<div id="address-search-container" className="relative">
							{/* PlaceAutocompleteElement will be inserted here */}
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
				</div>
			),
		},
		// Step 2: Property Type, Status, Year Built
		{
			title: t('new.steps.step2'),
			fields: ['property_type', 'year_built'],
			isValid: () => {
				return !!form.getValues('property_type');
			},
			component: (
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="property_type"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('new.fields.propertyType')}</FormLabel>
								<Select onValueChange={field.onChange} value={field.value}>
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
										type="number"
										min={1800}
										max={new Date().getFullYear()}
										{...field}
										onChange={(e) => handleNumericChange(field, e.target.value)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			),
		},
		// Step 3: Rooms, Bathrooms, Size
		{
			title: t('new.steps.step3'),
			fields: ['bedrooms', 'bathrooms', 'square_meters'],
			isValid: () => true,
			component: (
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="bedrooms"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('new.fields.bedrooms')}</FormLabel>
								<FormControl>
									<Input
										type="number"
										{...field}
										onChange={(e) => handleNumericChange(field, e.target.value)}
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
										type="number"
										min={0}
										value={field.value ?? ''}
										onChange={(e) => handleNumericChange(field, e.target.value)}
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
										type="number"
										min={0}
										value={field.value ?? ''}
										onChange={(e) => handleNumericChange(field, e.target.value)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			),
		},
		// Step 4: Purchase Price, Current Value
		{
			title: t('new.steps.step4'),
			fields: ['purchase_price', 'current_value'],
			isValid: () => true,
			component: (
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="purchase_price"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('new.fields.purchasePrice')}</FormLabel>
								<FormControl>
									<Input
										type="number"
										min={0}
										value={field.value ?? ''}
										onChange={(e) => handleNumericChange(field, e.target.value)}
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
										type="number"
										min={0}
										value={field.value ?? ''}
										onChange={(e) => handleNumericChange(field, e.target.value)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			),
		},
		// Step 5: Upload Photos
		{
			title: t('new.steps.step5'),
			fields: ['image_urls'],
			isValid: () => true,
			component: (
				<div className="space-y-4">
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
				</div>
			),
		},
	];

	// Property types and rental statuses
	const propertyTypes = [
		{ value: 'singleFamily', label: t('types.singleFamily') },
		{ value: 'apartment', label: t('types.apartment') },
		{ value: 'condo', label: t('types.condo') },
		{ value: 'townhouse', label: t('types.townhouse') },
		{ value: 'duplex', label: t('types.duplex') },
		{ value: 'commercial', label: t('types.commercial') },
		{ value: 'other', label: t('types.other') },
	];

	// Remove image at specific index
	const removeImage = (index: number) => {
		setImages((prevImages) => prevImages.filter((_, i) => i !== index));

		// Also remove the preview URL and release the object URL
		URL.revokeObjectURL(imagePreviewUrls[index]);
		setImagePreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
	};

	// Upload images to storage
	const uploadImages = async () => {
		if (images.length === 0 || !propertyId) return [];

		const uploadPromises = images.map(async (image) => {
			const filename = `${propertyId}/${Date.now()}-${image.name}`;
			const { error } = await supabase.storage.from('properties').upload(filename, image);

			if (error) {
				console.error('Error uploading image:', error);
				return null;
			}

			const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filename);

			return urlData.publicUrl;
		});

		const urls = await Promise.all(uploadPromises);
		return urls.filter(Boolean) as string[];
	};

	// Create new property on first step
	const createProperty = async () => {
		try {
			const { data, error } = await supabase
				.from('properties')
				.insert({
					name: form.getValues('name'),
					address: form.getValues('address'),
					latitude: form.getValues('latitude'),
					longitude: form.getValues('longitude'),
					created_by: userId,
					status: 'active',
				})
				.select('id')
				.single();

			if (error) throw error;
			return data.id;
		} catch (err) {
			console.error('Error creating property:', err);
			setError(t('new.errors.createFailed'));
			toast.error(t('new.errors.createFailed'));
			return null;
		}
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
			toast.error(t('new.errors.updateFailed'));
			return false;
		}
	};

	// Update handleNext to use step validation
	const handleNext = async () => {
		if (currentStep < steps.length - 1) {
			const isValid = await validateCurrentStep();
			if (!isValid) {
				return;
			}

			console.log('Submitting step:', currentStep);
			setIsSubmitting(true);

			try {
				// First step - create the property
				if (currentStep === 0 && !propertyId) {
					const id = await createProperty();
					if (id) {
						setPropertyId(id);
						setCurrentStep(currentStep + 1);
					}
				}
				// Subsequent steps - update property
				else if (propertyId) {
					const fieldsToUpdate = steps[currentStep].fields.reduce((acc, field) => {
						// @ts-expect-error - dynamic field access
						acc[field] = form.getValues(field);
						return acc;
					}, {} as Partial<FormData>);

					const success = await updateProperty(propertyId, fieldsToUpdate);
					if (success) {
						setCurrentStep(currentStep + 1);
					}
				}
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	// Update handlePrevious to maintain validation state
	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	// Add effect to validate step when fields change
	useEffect(() => {
		const currentStepFields = steps[currentStep].fields;
		const subscription = form.watch((value, { name, type }) => {
			if (name && currentStepFields.includes(name)) {
				validateCurrentStep();
			}
		});
		return () => subscription.unsubscribe();
	}, [currentStep, form]);

	// Handle final submission
	const handleFinish = async () => {
		if (!propertyId) return;

		setIsSubmitting(true);

		try {
			// Upload images and get URLs
			const urls = await uploadImages();

			// Update property with image URLs
			await updateProperty(propertyId, { image_urls: urls });

			toast.success(t('new.success.created'));
			router.push(`/${locale}/dashboard/properties/${propertyId}`);
			router.refresh();
		} catch (err) {
			console.error('Error finalizing property:', err);
			setError(t('new.errors.finalizeFailed'));
			toast.error(t('new.errors.finalizeFailed'));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Clean up object URLs on unmount
	useEffect(() => {
		return () => {
			imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [imagePreviewUrls]);

	// Update the handleMapClick function to use updateMarker
	const handleMapClick = (e: google.maps.MapMouseEvent) => {
		const latLng = e.latLng;
		if (!latLng) return;
		const lat = latLng.lat();
		const lng = latLng.lng();

		// Update form values for lat/long
		form.setValue('latitude', lat);
		form.setValue('longitude', lng);

		// Update the marker
		updateMarker(lat, lng);
	};

	const handleNumericChange = (field: any, value: string) => {
		const numValue = value === '' ? undefined : Number(value);
		field.onChange(numValue);
	};

	return (
		<Form {...form}>
			<form className="space-y-8">
				<div className="relative">
					{/* Progress indicator */}
					<div className="mb-6">
						<div className="flex justify-between mb-2">
							{steps.map((step, index) => (
								<div
									key={index}
									className={`flex items-center justify-center rounded-full h-8 w-8 text-xs 
										${
											index === currentStep
												? 'bg-primary text-primary-foreground'
												: index < currentStep
													? 'bg-primary/80 text-primary-foreground'
													: 'bg-muted text-muted-foreground'
										}`}
								>
									{index + 1}
								</div>
							))}
						</div>
						<div className="relative w-full h-2 bg-muted rounded-full">
							<div
								className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
								style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
							/>
						</div>
					</div>

					{/* Step title */}
					<h2 className="text-xl font-medium mb-4">{steps[currentStep].title}</h2>

					{/* Form steps */}
					<div className="mb-6">{steps[currentStep].component}</div>

					{error && (
						<div className="p-4 bg-red-50 text-red-700 rounded-md text-sm mt-4">
							{error}
						</div>
					)}

					{/* Navigation buttons */}
					<div className="flex justify-between mt-8">
						<Button
							type="button"
							variant="outline"
							onClick={handlePrevious}
							disabled={currentStep === 0 || isSubmitting}
						>
							{t('new.actions.previous')}
						</Button>

						{currentStep < steps.length - 1 ? (
							<Button type="button" onClick={handleNext} disabled={isSubmitting}>
								{isSubmitting ? t('new.actions.saving') : t('new.actions.next')}
							</Button>
						) : (
							<Button type="button" onClick={handleFinish} disabled={isSubmitting}>
								{isSubmitting
									? t('new.actions.finalizing')
									: t('new.actions.finish')}
							</Button>
						)}
					</div>
				</div>
			</form>
		</Form>
	);
}
