'use client';

import { useState } from 'react';
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
		resolver: zodResolver(formSchema) as Resolver<FormData>,
		defaultValues: {
			name: '',
			address: '',
			property_type: '',
			bedrooms: 0,
			bathrooms: 0,
			square_meters: 0,
			year_built: new Date().getFullYear(),
			purchase_date: undefined,
			purchase_price: 0,
			current_value: 0,
			description: '',
			status: 'active',
			image_urls: [],
			...prefilledData,
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		setError(null);

		try {
			const { error } = await supabase.from('properties').insert({
				...data,
				created_by: userId,
				status: 'active',
				image_urls: [],
			});

			if (error) throw error;

			toast.success(t('new.success.created'));
			router.push(`/${locale}/dashboard/properties`);
			router.refresh();
		} catch (err: any) {
			console.error('Error creating property:', err);
			setError(t('new.errors.createFailed'));
			toast.error(t('new.errors.createFailed'));
		} finally {
			setIsSubmitting(false);
		}
	};

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

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
										onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
										onChange={(e) => field.onChange(e.target.valueAsNumber)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
											field.onChange(parseInt(e.target.value, 10))
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
										onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
											field.onChange(parseInt(e.target.value, 10))
										}
									/>
								</FormControl>
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
											field.onChange(parseInt(e.target.value, 10))
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
											field.onChange(parseInt(e.target.value, 10))
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
											field.onChange(parseInt(e.target.value, 10))
										}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem className="sm:col-span-2">
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
				</div>

				{error && (
					<div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
				)}

				<div className="flex justify-end">
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? t('new.actions.creating') : t('new.actions.create')}
					</Button>
				</div>
			</form>
		</Form>
	);
}
