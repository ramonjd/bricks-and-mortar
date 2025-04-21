'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export type Property = {
	id: string;
	name: string | null;
	address: string;
	status: string;
	updated_at: string;
};

const NameHeader = () => {
	const t = useTranslations('properties.table');
	return <div>{t('name')}</div>;
};

const NameCell = ({ value }: { value: string | null }) => {
	const t = useTranslations('properties.table');
	return <div>{value || t('untitled')}</div>;
};

const AddressHeader = () => {
	const t = useTranslations('properties.table');
	return <div>{t('address')}</div>;
};

const StatusHeader = () => {
	const t = useTranslations('properties.table');
	return <div>{t('status')}</div>;
};

const StatusCell = ({ value }: { value: string }) => {
	const t = useTranslations('properties.status');
	return <Badge variant={value === 'active' ? 'default' : 'secondary'}>{t(value)}</Badge>;
};

const LastUpdatedHeader = () => {
	const t = useTranslations('properties.table');
	return <div>{t('lastUpdated')}</div>;
};

const LastUpdatedCell = ({ value }: { value: string }) => {
	return <div>{format(new Date(value), 'PPp')}</div>;
};

export const columns: ColumnDef<Property>[] = [
	{
		accessorKey: 'name',
		header: () => <NameHeader />,
		cell: ({ row }) => <NameCell value={row.getValue('name')} />,
	},
	{
		accessorKey: 'address',
		header: () => <AddressHeader />,
	},
	{
		accessorKey: 'status',
		header: () => <StatusHeader />,
		cell: ({ row }) => <StatusCell value={row.getValue('status')} />,
	},
	{
		accessorKey: 'updated_at',
		header: () => <LastUpdatedHeader />,
		cell: ({ row }) => <LastUpdatedCell value={row.getValue('updated_at')} />,
	},
];
