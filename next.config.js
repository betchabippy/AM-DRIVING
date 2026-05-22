/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, 'mapbox-gl': 'mapbox-gl' }
    return config
  },
}

module.exports = nextConfig
