/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix workspace root detection
  outputFileTracingRoot: __dirname,

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
    // Optimize images for performance and quality
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Allow larger images to preserve quality
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024, 1280, 1536, 2048],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Exclude Expo Router files from Next.js routing
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Webpack configuration
  webpack: (config, { isServer }) => {
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
