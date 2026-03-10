import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default withBundleAnalyzer(nextConfig);
