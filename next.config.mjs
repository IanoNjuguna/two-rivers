/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable experimental features that might cause issues
  experimental: {},
  allowedDevOrigins: ["127.0.0.1:3000", "localhost:3000"],
  webpack: (config, { isServer }) => {
    // Ignore markdown and other non-JS files in node_modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    return config;
  },
}

export default nextConfig
