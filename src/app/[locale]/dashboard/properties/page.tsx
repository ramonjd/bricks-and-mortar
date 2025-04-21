import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/properties/DataTable';
import { columns } from '@/components/properties/columns';

export default async function PropertiesPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`/${locale}/login`);
	}

	console.log('Current user:', user.id);

	const { data: properties, error } = await supabase
		.from('properties')
		.select('*')
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('Error fetching properties:', error);
	}

	console.log('Fetched properties:', properties);

	return (
		<div className="container mx-auto py-10">
			<DataTable columns={columns} data={properties || []} />
		</div>
	);
}
