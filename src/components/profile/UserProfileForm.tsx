'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import DeleteAccountDialog from './DeleteAccountDialog';

type UserProfile = {
	id: string;
	name: string;
	phone: string;
	avatar_url: string | null;
	created_at?: string;
	updated_at?: string;
};

type UserProfileFormProps = {
	userId: string;
	email: string;
	initialProfile?: UserProfile | null;
};

export default function UserProfileForm({ userId, email, initialProfile }: UserProfileFormProps) {
	const t = useTranslations();
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [name, setName] = useState(initialProfile?.name || '');
	const [phone, setPhone] = useState(initialProfile?.phone || '');
	const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || null);
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(!initialProfile);

	// Fetch user profile data if not provided as initialProfile
	useEffect(() => {
		const fetchUserProfile = async () => {
			if (initialProfile) return;

			try {
				setLoading(true);
				const { data, error } = await supabase
					.from('user_profiles')
					.select('*')
					.eq('id', userId)
					.single();

				if (error) {
					console.error('Error fetching profile:', error);
					return;
				}

				if (data) {
					setName(data.name || '');
					setPhone(data.phone || '');
					setAvatarUrl(data.avatar_url);
				}
			} catch (err) {
				console.error('Error fetching profile:', err);
			} finally {
				setLoading(false);
			}
		};

		fetchUserProfile();
	}, [userId, initialProfile]);

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		const fileType = file.type;
		if (!['image/jpeg', 'image/png', 'image/gif'].includes(fileType)) {
			setError(t('profile.errors.invalidFileType'));
			return;
		}

		try {
			setUploading(true);
			setError(null);

			// Upload file to Supabase Storage
			const fileExt = file.name.split('.').pop();
			const fileName = `${userId}-${Math.random()}.${fileExt}`;
			const filePath = `avatars/${fileName}`;

			const { error: uploadError } = await supabase.storage
				.from('avatars')
				.upload(filePath, file);

			if (uploadError) {
				throw uploadError;
			}

			// Get public URL
			const {
				data: { publicUrl },
			} = supabase.storage.from('avatars').getPublicUrl(filePath);

			setAvatarUrl(publicUrl);
		} catch (err) {
			console.error('Error uploading avatar:', err);
			setError(t('profile.errors.uploadFailed'));
		} finally {
			setUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(false);

		try {
			const profileData = {
				name,
				phone,
				avatar_url: avatarUrl,
				updated_at: new Date().toISOString(),
			};

			// Always use upsert to handle both insert and update cases
			const { error: upsertError } = await supabase.from('user_profiles').upsert(
				{
					...profileData,
					id: userId,
					created_at: initialProfile?.created_at || new Date().toISOString(),
				},
				{ onConflict: 'id' }
			);

			if (upsertError) {
				throw upsertError;
			}

			setSuccess(true);
			setTimeout(() => {
				router.refresh();
			}, 1000);
		} catch (err) {
			console.error('Error saving profile:', err);
			setError(t('profile.errors.saveFailed'));
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-2xl mx-auto flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="flex flex-col items-center mb-6">
					<div
						className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200 bg-gray-50"
						onClick={handleAvatarClick}
					>
						{avatarUrl ? (
							<Image
								src={avatarUrl}
								alt={t('profile.avatarAlt')}
								fill
								sizes="128px"
								className="object-cover"
							/>
						) : (
							<div className="flex items-center justify-center w-full h-full text-gray-400">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-12 h-12"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
						)}
						{uploading && (
							<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
								<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
							</div>
						)}
					</div>
					<input
						type="file"
						accept="image/png, image/jpeg, image/gif"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="hidden"
					/>
					<p className="mt-2 text-sm text-gray-500">{t('profile.clickToUpload')}</p>
					<p className="text-xs text-gray-400">{t('profile.supportedFormats')}</p>
				</div>

				<div className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							{t('auth.emailAddress')}
						</label>
						<input
							type="email"
							id="email"
							value={email}
							disabled
							className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-600 sm:text-sm"
						/>
						<p className="mt-1 text-xs text-gray-500">
							{t('profile.emailCannotBeChanged')}
						</p>
					</div>

					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700">
							{t('profile.name')}
						</label>
						<input
							type="text"
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							required
						/>
					</div>

					<div>
						<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
							{t('profile.phone')}
						</label>
						<input
							type="tel"
							id="phone"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						/>
					</div>
				</div>

				{error && (
					<div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
				)}

				{success && (
					<div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
						{t('profile.profileSaved')}
					</div>
				)}

				<div className="flex justify-between mt-6">
					<DeleteAccountDialog userId={userId} />
					<Button type="submit" disabled={saving || uploading}>
						{saving ? t('common.saving') : t('common.save')}
					</Button>
				</div>
			</form>
		</div>
	);
}
