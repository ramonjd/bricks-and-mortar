const withNextIntl = require('next-intl/plugin')('./src/lib/i18n/getTranslations.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: [
			'127.0.0.1',
			'localhost',
			// Add your production Supabase URL here when deploying
			// Example: 'your-project-id.supabase.co'
		],
	},
};

module.exports = withNextIntl(nextConfig);
