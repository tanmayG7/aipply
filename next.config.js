/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'img.naukimg.com',
      'img.naukri.com',
      'images.unsplash.com', // CV services hero image
      'i.pravatar.cc' // Testimonial avatars
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
