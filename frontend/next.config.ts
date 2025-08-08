import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Allow images from external domains
  images: {
    domains: ['localhost'],
  },

  // Configure ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Configure TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
