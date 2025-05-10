import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const supabase = createClient();
		const { addresses } = await request.json();
		if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
			return NextResponse.json({ error: 'Addresses array is required' }, { status: 400 });
		}

		// Trim and normalize addresses for comparison
		const trimmedAddresses = addresses.map((addr) => addr.trim().toLowerCase());
		console.log('Searching for addresses:', trimmedAddresses);

		// Get all properties to debug
		const { data, error } = await supabase.from('properties').select('*').limit(10);

		console.log('Database query result:', { data, error });

		if (error) {
			console.error('Database error:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		if (!data || data.length === 0) {
			console.log('No properties found in database');
			return NextResponse.json({ results: {} });
		}

		// Map each address to its existence status using case-insensitive comparison
		const results: { [address: string]: boolean } = {};
		trimmedAddresses.forEach((addr) => {
			results[addr] = data.some((item) => item.address.toLowerCase().includes(addr));
		});

		console.log('Results mapping:', results);
		return NextResponse.json({ results });
	} catch (error) {
		console.error('Server error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
