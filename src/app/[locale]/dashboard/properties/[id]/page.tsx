import { unstable_setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Home, Calendar, Ruler, DollarSign } from 'lucide-react';

export default async function PropertyDetailPage({
	params: { locale, id },
}: {
	params: { locale: string; id: string };
}) {
	// Enable static rendering
	unstable_setRequestLocale(locale);

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Check if user is authenticated
	if (!user) {
		redirect(`/${locale}/login`);
	}

	// Fetch property data
	const { data: property, error } = await supabase
		.from('properties')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !property) {
		redirect(`/${locale}/dashboard/properties`);
	}

	const t = await getTranslations('properties');

	return (
		<div className="container mx-auto px-4 py-8 sm:px-6">
			<div className="mb-6">
				<Link
					href={`/${locale}/dashboard/properties`}
					className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
				>
					<ChevronLeft className="mr-1 h-4 w-4" />
					{t('backToList')}
				</Link>
				<h1 className="text-3xl font-bold mb-2">{property.name}</h1>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-6">
					{/* Property Images */}
					<div className="bg-white shadow rounded-lg overflow-hidden">
						{property.image_urls && property.image_urls.length > 0 ? (
							<div className="relative h-80 w-full">
								<Image
									src={property.image_urls[0]}
									alt={property.name}
									fill
									className="object-cover"
								/>
							</div>
						) : (
							<div className="h-80 bg-muted flex items-center justify-center">
								<p className="text-muted-foreground">{t('detail.noImages')}</p>
							</div>
						)}

						{property.image_urls && property.image_urls.length > 1 && (
							<div className="grid grid-cols-4 gap-2 p-2">
								{property.image_urls
									.slice(1, 5)
									.map((url: string, index: number) => (
										<div
											key={index}
											className="relative h-20 rounded overflow-hidden"
										>
											<Image
												src={url}
												alt={`${property.name} ${index + 2}`}
												fill
												className="object-cover"
											/>
										</div>
									))}
							</div>
						)}
					</div>

					{/* Address */}
					<div className="bg-white shadow rounded-lg p-6">
						<div className="flex items-start gap-4">
							<div className="bg-muted p-3 rounded-full">
								<MapPin className="h-6 w-6" />
							</div>
							<div>
								<h3 className="text-lg font-medium mb-2">{t('detail.location')}</h3>
								<p className="whitespace-pre-line">{property.address}</p>
							</div>
						</div>
					</div>

					{/* Description */}
					{property.description && (
						<div className="bg-white shadow rounded-lg p-6">
							<h3 className="text-lg font-medium mb-4">{t('detail.description')}</h3>
							<p className="whitespace-pre-line">{property.description}</p>
						</div>
					)}
				</div>

				<div className="space-y-6">
					{/* Property Details */}
					<div className="bg-white shadow rounded-lg p-6">
						<h3 className="text-lg font-medium mb-4">{t('detail.propertyDetails')}</h3>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<Home className="h-5 w-5 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										{t('detail.propertyType')}
									</p>
									<p className="font-medium">
										{t(`types.${property.property_type}`)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Calendar className="h-5 w-5 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										{t('detail.yearBuilt')}
									</p>
									<p className="font-medium">{property.year_built}</p>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-2 mt-4">
								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-sm text-muted-foreground">
										{t('detail.bedrooms')}
									</p>
									<p className="font-medium">{property.bedrooms}</p>
								</div>

								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-sm text-muted-foreground">
										{t('detail.bathrooms')}
									</p>
									<p className="font-medium">{property.bathrooms}</p>
								</div>

								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-sm text-muted-foreground">
										{t('detail.squareMeters')}
									</p>
									<p className="font-medium">{property.square_meters} m²</p>
								</div>
							</div>
						</div>
					</div>

					{/* Financial Details */}
					<div className="bg-white shadow rounded-lg p-6">
						<h3 className="text-lg font-medium mb-4">{t('detail.financialDetails')}</h3>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<DollarSign className="h-5 w-5 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										{t('detail.purchasePrice')}
									</p>
									<p className="font-medium">
										{new Intl.NumberFormat(locale, {
											style: 'currency',
											currency: 'USD',
										}).format(property.purchase_price)}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Ruler className="h-5 w-5 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">
										{t('detail.currentValue')}
									</p>
									<p className="font-medium">
										{new Intl.NumberFormat(locale, {
											style: 'currency',
											currency: 'USD',
										}).format(property.current_value)}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="bg-white shadow rounded-lg p-6">
						<Button className="w-full mb-2" variant="default">
							{t('detail.actions.edit')}
						</Button>

						<Button className="w-full" variant="outline">
							{t('detail.actions.expenses')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
