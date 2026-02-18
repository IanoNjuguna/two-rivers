import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  webpack: (config, { isServer }) => {
    // Ignore problematic files in node_modules
    config.module.rules.push({
      test: /\.(md|zip|sh)$/,
      type: 'asset/resource',
      generator: {
        emit: false, // Don't emit these files
      },
    });

    return config;
  },
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

export default withNextIntl(nextConfig);
