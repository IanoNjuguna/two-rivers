import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@account-kit/react",
    "@account-kit/infra",
    "@account-kit/logging",
    "jose"
  ],
  // Disable experimental features that might cause issues
  experimental: {
  },
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://127.0.0.1:3001/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Ignore markdown and other non-JS files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    // Handle jose and other ESM packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
    };

    return config;
  },
}

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
