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
  // compiler: {
  //   removeConsole: {
  //     exclude: ["error"],
  //   },
  // },
  env: {
    PLUNK_PUBLIC_API_KEY: process.env.PLUNK_PUBLIC_API_KEY,
  },
};

module.exports = nextConfig;
