/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/terms-of-service", destination: "/terms-and-conditions", permanent: true },
    ];
  },
};

export default nextConfig;
