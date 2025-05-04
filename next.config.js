/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'ui-avatars.com',
      'static-cse.canva.com',
      'images.unsplash.com',
      'example.com'
    ],
  },
}

module.exports = nextConfig