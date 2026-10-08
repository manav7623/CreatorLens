function sanitizeUrl(url, fallback) {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (
    trimmed.includes('your-render-backend') ||
    trimmed.includes('your-backend') ||
    trimmed.includes('example.com') ||
    trimmed.includes('placeholder') ||
    trimmed === ''
  ) {
    return fallback;
  }
  return trimmed;
}

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
    NEXT_PUBLIC_API_URL: sanitizeUrl(process.env.NEXT_PUBLIC_API_URL, 'https://creatorlens-hydg.onrender.com/api'),
    NEXT_PUBLIC_SOCKET_URL: sanitizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL, 'https://creatorlens-hydg.onrender.com'),
  }
}

module.exports = nextConfig

