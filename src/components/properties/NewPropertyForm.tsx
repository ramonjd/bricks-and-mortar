'use client';

import { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface NewPropertyFormProps {
	userId: string;
	locale: string;
	prefilledData?: Partial<FormData>;
}

export default function NewPropertyForm({
	userId,
	locale,
	prefilledData = {},
}: NewPropertyFormProps) {
	const t = useTranslations('properties');
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentStep, setCurrentStep] = useState(0);
	const [direction, setDirection] = useState(0);
	const [propertyId, setPropertyId] = useState<string | null>(null);
	const [images, setImages] = useState<File[]>([]);
	// Using the image_urls from form data
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

	const formSchema = z.object({
		name: z.string().min(1, t('new.validation.nameRequired')),
		address: z.string().min(1, t('new.validation.addressRequired')),
		latitude: z.number().optional(),
		longitude: z.number().optional(),
		property_type: z.string().min(1, t('new.validation.typeRequired')),
		rental_status: z.string().default('owner_occupied'),
		bedrooms: z.number().min(0),
		bathrooms: z.number().min(0),
		square_meters: z.number().min(0),
		year_built: z.number().min(1800).max(new Date().getFullYear()),
		purchase_price: z.number().min(0),
		current_value: z.number().min(0),
		description: z.string().optional(),
		status: z.string().default('active'),
		image_urls: z.array(z.string()).default([]),
	});

	type FormData = z.infer<typeof formSchema>;

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema) as Resolver<FormData>,
		defaultValues: {
			name: '',
			address: '',
			property_type: '',
			rental_status: 'owner_occupied',
			bedrooms: 0,
			bathrooms: 0,
			square_meters: 0,
			year_built: new Date().getFullYear(),
			purchase_price: 0,
			current_value: 0,
			description: '',
			status: 'active',
			image_urls: [],
			...prefilledData,
		},
	});

	const steps = [
		// Step 1: Name
		{
			title: t('new.steps.step1'),
			fields: ['name'],
			isValid: () => {
				return !!form.getValues('name');
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
				</div>
			),
		},
		// Step 2: Address
		{
			title: t('new.steps.step2'),
			fields: ['address', 'latitude', 'longitude'],
			isValid: () => {
				return !!form.getValues('address');
			},
			component: (
				<div className="space-y-4">
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
											type="number"
											step="any"
											placeholder={t('new.placeholders.latitude')}
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value
														? parseFloat(e.target.value)
														: undefined
												)
											}
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
											type="number"
											step="any"
											placeholder={t('new.placeholders.longitude')}
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value
														? parseFloat(e.target.value)
														: undefined
												)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					{/* TODO: Add Google Maps integration here */}
					<p className="text-sm text-muted-foreground">
						{t('new.googleMaps.placeholder')}
					</p>
				</div>
			),
		},
		// Step 3: Property Type, Status, Year Built
		{
			title: t('new.steps.step3'),
			fields: ['property_type', 'rental_status', 'year_built'],
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
								<Select onValueChange={field.onChange} defaultValue={field.value}>
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
						name="rental_status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t('new.fields.rentalStatus')}</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue
												placeholder={t('new.placeholders.selectStatus')}
											/>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{rentalStatuses.map((status) => (
											<SelectItem key={status.value} value={status.value}>
												{status.label}
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
										min="1800"
										max={new Date().getFullYear()}
										placeholder={t('new.placeholders.yearBuilt')}
										{...field}
										onChange={(e) =>
											field.onChange(
												e.target.value
													? parseInt(e.target.value, 10)
													: undefined
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			),
		},
		// Step 4: Rooms, Bathrooms, Size
		{
			title: t('new.steps.step4'),
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
										min="0"
										{...field}
										onChange={(e) =>
											field.onChange(
												e.target.value ? parseInt(e.target.value, 10) : 0
											)
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
										type="number"
										min="0"
										step="0.5"
										{...field}
										onChange={(e) =>
											field.onChange(
												e.target.value ? parseFloat(e.target.value) : 0
											)
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
										type="number"
										min="0"
										{...field}
										onChange={(e) =>
											field.onChange(
												e.target.value ? parseInt(e.target.value, 10) : 0
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			),
		},
		// Step 5: Purchase Price, Current Value
		{
			title: t('new.steps.step5'),
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
										min="0"
										placeholder={t('new.placeholders.price')}
										{...field}
										onChange={(e) =>
											field.onChange(
												e.target.value ? parseInt(e.target.value, 10) : 0
											)
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
										type="number"
										min="0"
										placeholder={t('new.placeholders.price')}
										{...field}
										onChange={(e) =>
											field.onChange(
												e.target.value ? parseInt(e.target.value, 10) : 0
											)
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			),
		},
		// Step 6: Upload Photos
		{
			title: t('new.steps.step6'),
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

	const rentalStatuses = [
		{ value: 'owner_occupied', label: t('new.fields.rentalStatuses.ownerOccupied') },
		{ value: 'rented', label: t('new.fields.rentalStatuses.rented') },
		{ value: 'vacant', label: t('new.fields.rentalStatuses.vacant') },
	];

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

	// Navigate to next step and save data
	const handleNext = async () => {
		if (currentStep < steps.length - 1) {
			if (!steps[currentStep].isValid()) {
				form.trigger(steps[currentStep].fields as any);
				return;
			}

			setIsSubmitting(true);

			try {
				// First step - create the property
				if (currentStep === 0 && !propertyId) {
					const id = await createProperty();
					if (id) {
						setPropertyId(id);
						setDirection(1);
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
						setDirection(1);
						setCurrentStep(currentStep + 1);
					}
				}
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	// Navigate to previous step
	const handlePrevious = () => {
		if (currentStep > 0) {
			setDirection(-1);
			setCurrentStep(currentStep - 1);
		}
	};

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

	// Animation variants
	const variants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 1000 : -1000,
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			x: direction < 0 ? 1000 : -1000,
			opacity: 0,
		}),
	};

	return (
		<Form {...form}>
			<form className="space-y-8">
				<div className="relative overflow-hidden">
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

					{/* Form steps with animation */}
					<div className="relative h-[350px]">
						<AnimatePresence initial={false} custom={direction} mode="wait">
							<motion.div
								key={currentStep}
								custom={direction}
								variants={variants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.3, ease: 'easeInOut' }}
								className="absolute top-0 left-0 right-0"
							>
								{steps[currentStep].component}
							</motion.div>
						</AnimatePresence>
					</div>

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
