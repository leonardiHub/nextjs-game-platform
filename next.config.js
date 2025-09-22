/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  eslint: {
    // Disable ESLint during builds and development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds (optional)
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3068/api/:path*', // Proxy to Backend
      },
    ]
  },
  images: {
    domains: ['api-staging.4d99.co'],
  },
}

module.exports = nextConfig
