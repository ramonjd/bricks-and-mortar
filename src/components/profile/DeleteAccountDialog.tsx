'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import { deleteUser } from '@/lib/actions/auth';

type DeleteAccountDialogProps = {
	userId: string;
};

export default function DeleteAccountDialog({ userId }: DeleteAccountDialogProps) {
	const t = useTranslations();
	const locale = useLocale();
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

			// First sign out the user
			await supabase.auth.signOut();

			// Then delete the auth user using the server action
			await deleteUser(userId);

			// Close the dialog and redirect to the goodbye page with locale
			setIsOpen(false);
			router.push(`/${locale}/goodbye`);
		} catch (err) {
			console.error('Error deleting account:', err);
			setError(
				t('profile.deleteFailed') ||
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
