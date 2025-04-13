'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function deleteUser(userId: string) {
	// Get the current user's session
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// If no session, the user is not authenticated
	if (!session) {
		throw new Error('Unauthorized: User is not authenticated');
	}

	// Get the current user's ID
	const currentUserId = session.user.id;

	// Check if the user is trying to delete their own account or is an admin
	// For this example, we'll consider a user an admin if they have a specific role
	// You might want to implement a more sophisticated admin check based on your requirements
	const isAdmin = session.user.app_metadata?.role === 'admin';

	if (currentUserId !== userId && !isAdmin) {
		throw new Error('Unauthorized: Users can only delete their own accounts');
	}

	// Use the admin client to delete the user
	const adminClient = createAdminClient();
	const { error } = await adminClient.auth.admin.deleteUser(userId);

	if (error) {
		console.error('Error deleting user:', error);
		throw new Error('Failed to delete user');
	}

	return { success: true };
}
