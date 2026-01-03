/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'tqqieudrqdopvtgweuug.supabase.co',
      },
    ],
  },
  // Exclude Expo Router files from Next.js routing
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Ensure we're using App Router only
  experimental: {
    // Disable Pages Router detection
  },
  // Ignore Expo Router route groups
  webpack: (config, { isServer }) => {
    // Ignore Pages Router files if they exist
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      }
    }
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    // Ensure @react-google-maps/api is properly resolved
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
