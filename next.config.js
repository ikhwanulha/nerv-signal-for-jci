/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  experimental: {
    turbo: { root: '/Users/nerv/Desktop/ihsg-terminal' },
  },
}

module.exports = nextConfig
