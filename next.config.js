/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "reelty-storage.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/properties/**",
      },
    ],
  },
  // ... rest of your config
};

module.exports = nextConfig;
