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
<<<<<<< HEAD
};

module.exports = nextConfig;
=======
  async rewrites() {
    return [];
  },
};

module.exports = {
  ...nextConfig,
  webpack: (config) => {
    return config;
  },
  // Add this to allow connections from your local network
  experimental: {
    ...nextConfig.experimental,
  },
  // This is the important part
  server: {
    host: '0.0.0.0',
  },
};
>>>>>>> 8a13445 (first commit)
