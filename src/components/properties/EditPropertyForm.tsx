'use client';

// No useState needed
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import NewPropertyForm from './NewPropertyForm';
import { Toaster, toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

type FormData = {
	[key: string]: unknown;
};

interface EditPropertyFormProps {
	userId: string;
	locale: string;
	propertyId: string;
	property: Record<string, unknown>;
}

export default function EditPropertyForm({
	userId,
	locale,
	propertyId,
	property,
}: EditPropertyFormProps) {
	const t = useTranslations('properties');
	const router = useRouter();

	// Handle form submission for updating a property
	const handleFormSubmit = async (formData: FormData) => {
		try {
			const { error } = await supabase
				.from('properties')
				.update({
					...formData,
					updated_at: new Date().toISOString(),
				})
				.eq('id', propertyId)
				.select();

			if (error) {
				throw error;
			}

			toast.success(t('edit.success.updated'));

			// Redirect back to property detail page after successful update
			router.push(`/${locale}/dashboard/properties/${propertyId}`);
			router.refresh();
		} catch (error) {
			console.error('Error updating property:', error);
			toast.error(t('edit.errors.updateFailed'));
		}
	};

	return (
		<>
			<Toaster position="top-center" />
			<NewPropertyForm
				userId={userId}
				locale={locale}
				prefilledData={property}
				onFormSubmit={handleFormSubmit}
			/>
		</>
	);
}