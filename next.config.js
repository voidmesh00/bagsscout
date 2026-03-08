/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.bags.fm' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
}

module.exports = nextConfig
