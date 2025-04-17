'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Property form validation schema
const formSchema = (t: any) => z.object({
  name: z.string().min(2, { message: t('new.validation.nameRequired') }),
  address: z.string().min(5, { message: t('new.validation.addressRequired') }),
  property_type: z.string().min(1, { message: t('new.validation.typeRequired') }),
  purchase_date: z.string().optional(),
  purchase_price: z.string().optional(),
  current_value: z.string().optional(),
  square_meters: z.string().min(1, { message: t('new.validation.squareMetersRequired') }),
  bedrooms: z.string().min(1, { message: t('new.validation.bedroomsRequired') }),
  bathrooms: z.string().min(1, { message: t('new.validation.bathroomsRequired') }),
  year_built: z.string().optional(),
  description: z.string().optional(),
  is_rental: z.boolean().default(false),
  // We'll handle image uploads separately
});

type PropertyFormValues = z.infer<ReturnType<typeof formSchema>>;

interface NewPropertyFormProps {
  userId: string;
  locale: string;
}

export default function NewPropertyForm({ userId, locale }: NewPropertyFormProps) {
  const t = useTranslations('properties');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with validation schema
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      name: '',
      address: '',
      property_type: '',
      purchase_date: '',
      purchase_price: '',
      current_value: '',
      square_meters: '',
      bedrooms: '',
      bathrooms: '',
      year_built: '',
      description: '',
      is_rental: false,
    },
  });

  const isRental = form.watch('is_rental');

  // Handle form submission
  async function onSubmit(data: PropertyFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Format data for Supabase insert
      const propertyData = {
        ...data,
        purchase_date: data.purchase_date || null,
        purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
        current_value: data.current_value ? parseFloat(data.current_value) : null,
        square_meters: parseFloat(data.square_meters),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        year_built: data.year_built ? parseInt(data.year_built) : null,
        status: 'active',
        image_urls: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert property data
      const { data: newProperty, error: insertError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Create relationship between user and property
      const { error: relationError } = await supabase.from('property_users').insert({
        property_id: newProperty.id,
        user_id: userId,
        role: isRental ? 'renter' : 'owner',
        ownership_percentage: isRental ? null : 100,
        start_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      if (relationError) throw relationError;

      // Redirect to the property detail page
      router.push(`/${locale}/dashboard/properties/${newProperty.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error creating property:', err);
      setError(t('new.errors.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const propertyTypes = [
    { value: 'single-family', label: t('types.singleFamily') },
    { value: 'apartment', label: t('types.apartment') },
    { value: 'condo', label: t('types.condo') },
    { value: 'townhouse', label: t('types.townhouse') },
    { value: 'duplex', label: t('types.duplex') },
    { value: 'commercial', label: t('types.commercial') },
    { value: 'other', label: t('types.other') },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Property Type and Rental Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.propertyType')}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('new.placeholders.selectType')} />
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
              </div>
              <div className="flex items-end mb-2">
                <FormField
                  control={form.control}
                  name="is_rental"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t('new.fields.isRental')}</FormLabel>
                        <FormDescription>
                          {t('new.help.isRental')}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{t('new.sections.basicInfo')}</h3>
            
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
                    <FormDescription>{t('new.help.name')}</FormDescription>
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
                      <Textarea placeholder={t('new.placeholders.address')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{t('new.sections.propertyDetails')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="square_meters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('new.fields.squareMeters')}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                      <Input type="number" min="1800" max={new Date().getFullYear()} placeholder={t('new.placeholders.yearBuilt')} {...field} />
                    </FormControl>
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
                      <Input type="number" min="0" {...field} />
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
                      <Input type="number" min="0" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information - Only show for owned properties */}
        {!isRental && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">{t('new.sections.financialInfo')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="purchase_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('new.fields.purchaseDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        <Input type="number" min="0" step="0.01" placeholder={t('new.placeholders.price')} {...field} />
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
                        <Input type="number" min="0" step="0.01" placeholder={t('new.placeholders.price')} {...field} />
                      </FormControl>
                      <FormDescription>{t('new.help.currentValue')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{t('new.sections.additionalInfo')}</h3>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('new.fields.description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('new.placeholders.description')} 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>{t('new.help.description')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/${locale}/dashboard/properties`)}
          >
            {t('new.actions.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('new.actions.creating') : t('new.actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}