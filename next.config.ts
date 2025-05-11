
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb', // Default is 1MB, increase for file uploads (data URIs)
    },
  },
   // i18n configuration - remove if using path-based routing via middleware exclusively
  // i18n: {
  //   locales: ['en', 'ar'],
  //   defaultLocale: 'en',
  // },
};

export default nextConfig;
