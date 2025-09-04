/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configured for Railway deployment (no standalone output needed)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
  images: {
    domains: ['i.ytimg.com', 'yt3.ggpht.com'], // YouTube thumbnail domains
    unoptimized: process.env.NODE_ENV === 'production', // Disable image optimization for static export
  },
  // Production optimizations
  experimental: {
    // optimizeCss: true, // Disabled due to critters module issues
  },
  // Ensure proper trailing slash handling
  trailingSlash: false,
};

module.exports = nextConfig;
