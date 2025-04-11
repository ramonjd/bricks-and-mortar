import { supabase } from '../supabase/client';
import type { Property } from '@/types';

export async function getProperties(userId: string) {
	const { data, error } = await supabase.from('properties').select('*').eq('created_by', userId);

	if (error) throw error;
	return data as Property[];
}

export async function getProperty(id: string) {
	const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();

	if (error) throw error;
	return data as Property;
}

export async function createProperty(property: Omit<Property, 'id' | 'createdAt'>) {
	const { data, error } = await supabase.from('properties').insert([property]).select().single();

	if (error) throw error;
	return data as Property;
}
