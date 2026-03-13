/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fortnite-api.com",
      },
      {
        protocol: "https",
        hostname: "cdn.fortnite-api.com",
      },
      {
        protocol: "https",
        hostname: "image.fnbr.co",
      },
    ],
  },
}

export default nextConfig
