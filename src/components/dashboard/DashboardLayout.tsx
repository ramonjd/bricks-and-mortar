'use client';

import { useState } from 'react';
import { AppShell, Burger, Group, UnstyledButton, Text, useMantineTheme, Divider, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconBuilding, IconReceipt, IconUsers, IconSettings, IconLogout, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSupabase } from '@/lib/hooks/useSupabase';

interface NavbarLinkProps {
	icon: React.ReactNode;
	label: string;
	active?: boolean;
	onClick?(): void;
	href: string;
}

function NavbarLink({ icon, label, active, onClick, href }: NavbarLinkProps) {
	return (
		<UnstyledButton
			component={Link}
			href={href}
			onClick={onClick}
			sx={(theme) => ({
				display: 'block',
				width: '100%',
				padding: theme.spacing.xs,
				borderRadius: theme.radius.sm,
				color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
				backgroundColor: active ? theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background : 'transparent',
				'&:hover': {
					backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
				},
			})}
		>
			<Group>
				{icon}
				<Text size="sm">{label}</Text>
			</Group>
		</UnstyledButton>
	);
}

interface DashboardLayoutProps {
	children: React.ReactNode;
	locale: string;
}

export function DashboardLayout({ children, locale }: DashboardLayoutProps) {
	const [opened, { toggle }] = useDisclosure();
	const theme = useMantineTheme();
	const pathname = usePathname();
	const t = useTranslations('navigation');
	const supabase = useSupabase();

	const mainLinks = [
		{ icon: <IconHome size="1.2rem" />, label: t('home'), href: `/${locale}/dashboard` },
		{ icon: <IconBuilding size="1.2rem" />, label: t('properties'), href: `/${locale}/dashboard/properties` },
		{ icon: <IconReceipt size="1.2rem" />, label: t('expenses'), href: `/${locale}/dashboard/expenses` },
		{ icon: <IconUsers size="1.2rem" />, label: t('tenants'), href: `/${locale}/dashboard/tenants` },
		{ icon: <IconSettings size="1.2rem" />, label: t('settings'), href: `/${locale}/dashboard/settings` },
	];

	const quickLinks = [
		{ icon: <IconUser size="1.2rem" />, label: t('profile'), href: `/${locale}/dashboard/profile` },
	];

	const handleLogout = async () => {
		await supabase.auth.signOut();
		window.location.href = `/${locale}/login`;
	};

	const mainNavLinks = mainLinks.map((link) => (
		<NavbarLink
			{...link}
			key={link.label}
			active={pathname === link.href}
		/>
	));

	const quickNavLinks = quickLinks.map((link) => (
		<NavbarLink
			{...link}
			key={link.label}
			active={pathname === link.href}
		/>
	));

	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{
				width: 300,
				breakpoint: 'sm',
				collapsed: { mobile: !opened },
			}}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md" justify="space-between">
					<Group>
						<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
						<Text size="lg" fw={700}>{t('appName')}</Text>
					</Group>
					<Group>
						<UnstyledButton
							onClick={handleLogout}
							sx={(theme) => ({
								display: 'flex',
								alignItems: 'center',
								padding: theme.spacing.xs,
								borderRadius: theme.radius.sm,
								color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
								'&:hover': {
									backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
								},
							})}
						>
							<Group gap="xs">
								<IconLogout size="1.2rem" />
								<Text size="sm">{t('logout')}</Text>
							</Group>
						</UnstyledButton>
					</Group>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar p="md">
				<AppShell.Section grow>
					<Stack gap="xs">
						{mainNavLinks}
					</Stack>
				</AppShell.Section>

				<Divider my="sm" />

				<AppShell.Section>
					<Stack gap="xs">
						{quickNavLinks}
					</Stack>
				</AppShell.Section>
			</AppShell.Navbar>

			<AppShell.Main>
				{children}
			</AppShell.Main>
		</AppShell>
	);
} 