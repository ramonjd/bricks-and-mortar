'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

type DeleteAccountDialogProps = {
	userId: string;
};

export default function DeleteAccountDialog({ userId }: DeleteAccountDialogProps) {
	const t = useTranslations();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDeleteAccount = async () => {
		if (!isConfirmed) return;

		try {
			setIsDeleting(true);
			setError(null);

			// First delete user profile
			const { error: profileError } = await supabase
				.from('user_profiles')
				.delete()
				.eq('user_id', userId);

			if (profileError) {
				throw profileError;
			}

			// Then sign out the user - we don't have admin API access in the client
			// The server will need to handle the actual auth user deletion via a webhook or server function

			// Sign out the user
			await supabase.auth.signOut();

			// Close the dialog and redirect to the home page
			setIsOpen(false);
			router.push('/');
		} catch (err) {
			console.error('Error deleting account:', err);
			setError(
				t('profile.errors.deleteFailed') ||
					'An error occurred while deleting your account. Please try again.'
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive" className="mt-6">
					{t('profile.deleteAccount') || 'Delete Account'}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t('profile.deleteAccountConfirmation') || 'Delete Account?'}
					</DialogTitle>
					<DialogDescription>
						{t('profile.deleteAccountWarning') ||
							'This action cannot be undone. Your account and all your data will be permanently deleted.'}
					</DialogDescription>
				</DialogHeader>

				<div className="flex items-start space-x-2 pt-4">
					<Checkbox
						id="confirm"
						checked={isConfirmed}
						onCheckedChange={(checked) => setIsConfirmed(!!checked)}
						className="mt-1"
					/>
					<label
						htmlFor="confirm"
						className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{t('profile.confirmDelete') ||
							'I understand that this action is irreversible and will delete all my data'}
					</label>
				</div>

				{error && <p className="text-sm text-destructive mt-2">{error}</p>}

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						{t('common.cancel') || 'Cancel'}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDeleteAccount}
						disabled={!isConfirmed || isDeleting}
					>
						{isDeleting
							? t('profile.deleting') || 'Deleting...'
							: t('profile.confirmDeleteButton') || 'Delete Account'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
