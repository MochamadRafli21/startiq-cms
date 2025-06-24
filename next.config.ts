import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://res.cloudinary.com/**")],
  },
  async redirects() {
    return [
      {
        source: "/robots.txt",
        destination: "/api/public/robots",
        permanent: true,
      },
      {
        source: "/sitemap.xml",
        destination: "/api/public/sitemap",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
