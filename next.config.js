const withNextIntl = require('next-intl/plugin')('./src/lib/i18n/getTranslations.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	},
	// Disable automatic static optimization for auth pages
	async generateStaticParams() {
		return {
			'/*/auth/*': { dynamic: true },
		};
	},
};

module.exports = withNextIntl(nextConfig);
