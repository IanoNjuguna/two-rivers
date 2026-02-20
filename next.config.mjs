import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable experimental features that might cause issues
  experimental: {
  },
  webpack: (config, { isServer }) => {
    // Ignore markdown and other non-JS files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },
}

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
