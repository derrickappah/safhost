/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Fix workspace root detection
  outputFileTracingRoot: __dirname,

  // CDN caching headers for better performance
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Optimize images for performance and quality
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // Increased to 1 hour for better caching
    // Optimized image sizes for better performance
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Enable image optimization
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Performance budgets
  // These will warn during build if exceeded
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

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

module.exports = withBundleAnalyzer(nextConfig)
