/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'api.dicebear.com',
      'ui-avatars.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'onrender.com',
      'creatorlens-hydg.onrender.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://creatorlens-hydg.onrender.com/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://creatorlens-hydg.onrender.com',
  }
}

module.exports = nextConfig
