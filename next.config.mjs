/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  api: {
    bodyParser: false,
  },
};

export default nextConfig;
