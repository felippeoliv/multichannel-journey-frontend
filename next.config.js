
/** @type {import(\'next\').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [\'localhost\', \'your-backend-domain.railway.app\'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: \'/api/:path*\',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

// Bundle analyzer
const withBundleAnalyzer = require(\'@next/bundle-analyzer\')({
  enabled: process.env.ANALYZE === \'true\',
});

module.exports = withBundleAnalyzer(nextConfig);


