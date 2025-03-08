/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hzaoxrubaprshvidnzig.supabase.co'], // Add your Supabase URL for image optimization
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    turbo: {
      loaders: {
        // Enable Turbopack features
        '.js': ['swc-loader'],
        '.ts': ['swc-loader'],
        '.tsx': ['swc-loader'],
      },
    },
  },
  // Enable React strict mode for better development practices
  reactStrictMode: true,
  // Enable SWC minification for better performance
  swcMinify: true,
  // Compress responses
  compress: true,
  // Configure headers for security and caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}
