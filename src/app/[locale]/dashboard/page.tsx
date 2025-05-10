'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Grid, Paper, Text, Title, Group, RingProgress, Stack, Button } from '@mantine/core';
import { IconBuilding, IconReceipt, IconUsers, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

interface DashboardPageProps {
	params: {
		locale: string;
	};
}

export default function DashboardPage({ params: { locale } }: DashboardPageProps) {
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const supabase = useSupabase();
	const t = useTranslations('dashboard');

	useEffect(() => {
		const checkAuth = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) {
				router.push(`/${locale}/login`);
			}
			setLoading(false);
		};

		checkAuth();
	}, [supabase.auth, router, locale]);

	if (loading) {
		return (
			<DashboardLayout locale={locale}>
				<Text>Loading...</Text>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout locale={locale}>
			<Stack gap="lg">
				<Group justify="space-between" align="center">
					<Title order={2}>{t('welcome')}</Title>
					<Button
						component={Link}
						href={`/${locale}/dashboard/properties/new`}
						leftSection={<IconPlus size="1.2rem" />}
					>
						{t('addProperty')}
					</Button>
				</Group>

				<Grid>
					<Grid.Col span={{ base: 12, md: 4 }}>
						<Paper p="md" radius="md" withBorder>
							<Group>
								<RingProgress
									size={80}
									roundCaps
									thickness={8}
									sections={[{ value: 75, color: 'blue' }]}
									label={
										<Text ta="center" size="xs" fw={700}>
											75%
										</Text>
									}
								/>
								<Stack gap={0}>
									<Text size="xl" fw={700}>12</Text>
									<Text size="sm" c="dimmed">{t('propertiesOccupied')}</Text>
								</Stack>
							</Group>
						</Paper>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 4 }}>
						<Paper p="md" radius="md" withBorder>
							<Group>
								<RingProgress
									size={80}
									roundCaps
									thickness={8}
									sections={[{ value: 60, color: 'green' }]}
									label={
										<Text ta="center" size="xs" fw={700}>
											60%
										</Text>
									}
								/>
								<Stack gap={0}>
									<Text size="xl" fw={700}>$24,500</Text>
									<Text size="sm" c="dimmed">{t('monthlyExpenses')}</Text>
								</Stack>
							</Group>
						</Paper>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 4 }}>
						<Paper p="md" radius="md" withBorder>
							<Group>
								<RingProgress
									size={80}
									roundCaps
									thickness={8}
									sections={[{ value: 90, color: 'orange' }]}
									label={
										<Text ta="center" size="xs" fw={700}>
											90%
										</Text>
									}
								/>
								<Stack gap={0}>
									<Text size="xl" fw={700}>45</Text>
									<Text size="sm" c="dimmed">{t('activeTenants')}</Text>
								</Stack>
							</Group>
						</Paper>
					</Grid.Col>
				</Grid>

				<Grid>
					<Grid.Col span={{ base: 12, md: 6 }}>
						<Paper p="md" radius="md" withBorder>
							<Stack gap="md">
								<Group justify="space-between">
									<Group gap="xs">
										<IconBuilding size="1.2rem" />
										<Title order={3}>{t('quickActions')}</Title>
									</Group>
								</Group>
								<Group>
									<Button
										component={Link}
										href={`/${locale}/dashboard/properties/new`}
										variant="light"
										leftSection={<IconPlus size="1.2rem" />}
									>
										{t('addProperty')}
									</Button>
									<Button
										component={Link}
										href={`/${locale}/dashboard/expenses/new`}
										variant="light"
										leftSection={<IconPlus size="1.2rem" />}
									>
										{t('addExpense')}
									</Button>
									<Button
										component={Link}
										href={`/${locale}/dashboard/tenants/new`}
										variant="light"
										leftSection={<IconPlus size="1.2rem" />}
									>
										{t('addTenant')}
									</Button>
								</Group>
							</Stack>
						</Paper>
					</Grid.Col>

					<Grid.Col span={{ base: 12, md: 6 }}>
						<Paper p="md" radius="md" withBorder>
							<Stack gap="md">
								<Group justify="space-between">
									<Group gap="xs">
										<IconReceipt size="1.2rem" />
										<Title order={3}>{t('recentActivity')}</Title>
									</Group>
								</Group>
								<Text c="dimmed">{t('noRecentActivity')}</Text>
							</Stack>
						</Paper>
					</Grid.Col>
				</Grid>
			</Stack>
		</DashboardLayout>
	);
}
