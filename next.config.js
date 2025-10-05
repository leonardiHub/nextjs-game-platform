/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Suppress hydration warnings in development
  reactStrictMode: false,
  // Suppress hydration warnings globally
  onDemandEntries: {
    // Suppress hydration warnings
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Experimental features to help with hydration
  experimental: {
    // Reduce hydration mismatches
    optimizePackageImports: ['lucide-react'],
  },
  eslint: {
    // Disable ESLint during builds and development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds (optional)
    ignoreBuildErrors: true,
  },
  async rewrites() {
    const backendPort = process.env.BACKEND_PORT || 3006
    const isProduction = process.env.NODE_ENV === 'production'

    // In production, let nginx handle the proxying
    if (isProduction) {
      return []
    }

    return [
      // Exclude paths that have Next.js API routes
      {
        source:
          '/api/((?!captcha|admin/users|admin/withdrawals|admin/withdrawal|admin/kyc|admin/seo|admin/hero-carousel|admin/games|seo).*)',
        destination: `http://localhost:${backendPort}/api/$1`, // Proxy to Backend
      },
      // Proxy uploads directory to backend
      {
        source: '/uploads/:path*',
        destination: `http://localhost:${backendPort}/uploads/:path*`,
      },
    ]
  },
  images: {
    domains: ['api-staging.4d99.co', 'fun88tha.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
