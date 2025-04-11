import { supabase } from '@/lib/supabase/client';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getServerSession() {
	const cookieStore = cookies();
	
	const supabaseServer = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					cookieStore.set({ name, value, ...options });
				},
				remove(name: string, options: any) {
					cookieStore.set({ name, value: '', ...options });
				},
			},
		}
	);

	const { data: { session } } = await supabaseServer.auth.getSession();
	return session;
}

export async function getSession() {
	const { data, error } = await supabase.auth.getSession();
	if (error) {
		console.error('Error getting session:', error);
		return null;
	}
	return data.session;
}