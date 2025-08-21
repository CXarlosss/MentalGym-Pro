// next.config.js
/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

const nextConfig = {
  reactStrictMode: true,
  compiler: { styledComponents: true },
  async rewrites() {
    if (!isDev) return [];
    return [
      // proxy genérico
      { source: '/api/:path*', destination: 'http://localhost:5000/api/:path*' },

      // 👇 soporta llamadas sin /api
      { source: '/stats/:path*', destination: 'http://localhost:5000/api/stats/:path*' },
      { source: '/fitness/:path*', destination: 'http://localhost:5000/api/fitness/:path*' },
      { source: '/gamification/:path*', destination: 'http://localhost:5000/api/gamification/:path*' },
      { source: '/nutrition/:path*', destination: 'http://localhost:5000/api/nutrition/:path*' },
      { source: '/cognitive/:path*', destination: 'http://localhost:5000/api/cognitive/:path*' },
      { source: '/sessions/:path*', destination: 'http://localhost:5000/api/sessions/:path*' },
    ];
  },
};

module.exports = nextConfig;
